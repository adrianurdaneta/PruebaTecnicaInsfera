using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using SqlKata.Compilers;
using System.Data;
using System.Text;
using WatchlistAPI.Data;
using WatchlistAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Entity Framework Core (Para Escrituras y Auth)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Intentar configurar MySQL; si falla (por falta de acceso), usar InMemory para permitir arrancar la app en desarrollo
try
{
    builder.Services.AddDbContext<WatchlistDbContext>(options =>
        // Use a fixed server version to avoid AutoDetect attempting a network connection at startup
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 25))));
}
catch
{
    builder.Services.AddDbContext<WatchlistDbContext>(options =>
        options.UseInMemoryDatabase("Watchlist_InMemory"));
}

// 2. Configurar Dapper y SqlKata (Para Lecturas Rápidas)
// Registrar un factory que cree una nueva MySqlConnection por alcance en lugar de compartir una instancia
try
{
    // Si la cadena de conexión es válida, registrar un factory que cree una conexión por request
    builder.Services.AddScoped<IDbConnection>(_ => new MySqlConnection(connectionString));
}
catch
{
    builder.Services.AddScoped<IDbConnection, WatchlistAPI.Infrastructure.FakeDbConnection>();
}
builder.Services.AddSingleton<Compiler, MySqlCompiler>();
builder.Services.AddScoped<IMediaReadService, MediaReadService>();

// 3. Configurar Autenticación con JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar CORS para el Frontend local
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173") // Puerto típico de Vite
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// En entorno Development: si la tabla users contiene entradas con password en texto plano
// (por ejemplo al importar seed.sql que contiene contraseñas en claro para pruebas),
// las convertimos a hashes BCrypt automáticamente al arrancar.
using (var scope = app.Services.CreateScope())
{
    var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
    if (env.IsDevelopment())
    {
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<WatchlistDbContext>();
            // Buscar usuarios cuyo PasswordHash no parezca estar hasheado (no comienza por $2)
            var plainUsers = db.Users.Where(u => !u.PasswordHash.StartsWith("$2")).ToList();
            if (plainUsers.Any())
            {
                foreach (var u in plainUsers)
                {
                    var plain = u.PasswordHash; // en el seed colocamos la contraseña en claro
                    u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plain);
                }
                db.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
            logger.LogWarning(ex, "No se pudo convertir contraseñas en claro en hashes al arrancar.");
        }
    }
}

app.Run();
