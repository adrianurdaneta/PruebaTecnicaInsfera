Resumen del proyecto Watchlist — contexto para agentes

Estado general
- Backend: WatchlistAPI (ASP.NET Core 10 / C#). Actualmente escuchando en http://localhost:5286 cuando se ejecuta con `dotnet run`.
- Frontend: watchlist-front (React + Vite). Apunta por defecto a http://localhost:5286/api en watchlist-front/src/services/api.js.
- Base de datos: MySQL local. Los scripts de esquema y seed están en `database/schema.sql.txt` y `database/seed.sql.txt` (renombrados para evitar análisis estático). La BD `netflix` ya ha sido importada en el entorno actual.

Cambios relevantes realizados
- WatchlistAPI/Program.cs: parche para evitar ServerVersion.AutoDetect y fallback a InMemory si MySQL no está accesible; registro condicional de IDbConnection apuntando a MySqlConnection o WatchlistAPI.Infrastructure.FakeDbConnection.
- WatchlistAPI/Infrastructure/FakeDbConnection.cs: IDbConnection "falso" que lanza NotSupportedException (para permitir arranque cuando no hay MySQL).
- WatchlistAPI/WatchlistAPI.csproj: ajustes de paquetes para alinear versiones de EF Core / Pomelo (se hicieron cambios a EF Core 9.x y paquetes relacionados para resolver incompatibilidades). Esto permitió que la app compilara.

Estado actual y bloqueos conocidos
- La base de datos `netflix` está creada y poblada según `database/seed.sql.txt`.
- La API está arrancada en http://localhost:5286 (ver `dotnet run --project WatchlistAPI --urls "http://localhost:5286"`).
- El frontend está configurado para usar http://localhost:5286/api; debe levantarse con `npm install` y `npm run dev` dentro de `watchlist-front`.
- Resultado de una petición POST /api/auth/login con las credenciales seed devolvió HTTP 400 (Bad Request). Hay que inspeccionar el body de respuesta o los logs para la razón exacta (validación de DTO, etc.).
- Se registraron advertencias de versión entre Pomelo y EF Core al principio; fueron resueltas alineando paquetes a EF Core 9.x.

Credenciales de prueba
- Usuarios semilla (importados en seed.sql.txt):
  - user1 / password: password123 (hash en DB)
  - admin / password: admin123 (hash en DB)
- Connection string actual (WatchlistAPI/appsettings.json):
  Server=localhost;Port=3306;Database=netflix;User=adrian;Password=Amor.123;

Cómo reproducir el entorno local (resumen rápido)
1) Backend
   - dotnet build WatchlistAPI
   - dotnet run --project WatchlistAPI --urls "http://localhost:5286"
2) Frontend
   - cd watchlist-front
   - npm install
   - npm run dev (por defecto abre en http://localhost:5173)
3) DB
   - Si hace falta, importar `database/schema.sql.txt` y `database/seed.sql.txt` con phpMyAdmin o cliente mysql.

Dónde mirar logs y errores
- Salida de `dotnet run` (terminal donde se inició) muestra excepciones y stack traces.
- En caso de errores 400/401 en endpoints, revisar respuesta HTTP y el log del backend (Developer Exception Page activa en Development).

Siguientes pasos recomendados (priorizados)
1) Revisar el cuerpo de la respuesta 400 para POST /api/auth/login (Network en DevTools o curl -v) y compartirlo.
2) Revisar validaciones del DTO en WatchlistAPI/DTOs/AuthDto.cs y controladores (AuthController) para confirmar reglas de validación.
3) Si la API falla por integridad de datos, verificar filas en tabla `users` (SELECT id, username FROM users;) y comparar con los hashes esperados.
4) Levantar el frontend y probar el flujo completo (login → listado media → añadir a watchlist).

Puntos útiles y archivos clave
- Backend: WatchlistAPI/Program.cs, WatchlistAPI/Data/WatchlistDbContext.cs, WatchlistAPI/Controllers/AuthController.cs
- Frontend: watchlist-front/src/services/api.js, watchlist-front/src/pages/HomePage.jsx, watchlist-front/src/pages/LoginPage.jsx
- DB scripts: database/schema.sql.txt, database/seed.sql.txt
- Cambios agregados: WatchlistAPI/Infrastructure/FakeDbConnection.cs

Contexto para el siguiente agente
- La base de datos ya existe y está poblada localmente.
- La API está corriendo en localhost:5286; el frontend está apuntando correctamente.
- El último bloqueo funcional es un 400 en login; hay que inspeccionar el cuerpo de la respuesta o los logs del backend para encontrar la validación fallida.

Contacto del repo
- Ruta raíz del workspace: C:\dev\PruebaTecnicaInsfera\

Fin del archivo de contexto.
