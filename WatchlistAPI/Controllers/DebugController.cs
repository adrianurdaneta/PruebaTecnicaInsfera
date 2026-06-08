using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchlistAPI.Data;

namespace WatchlistAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly WatchlistDbContext _context;
        private readonly IHostEnvironment _env;

        public DebugController(WatchlistDbContext context, IHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // Dev-only endpoint to list users and their password hashes for local debugging
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            if (!_env.IsDevelopment())
                return Forbid();

            var users = await _context.Users.Select(u => new
            {
                u.Id,
                u.Username,
                u.PasswordHash
            }).ToListAsync();

            return Ok(users);
        }

        // Dev-only: verificar si una contraseña coincide con el hash de un usuario
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyRequest req)
        {
            if (!_env.IsDevelopment())
                return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            return Ok(new { Username = user.Username, PasswordMatches = ok, StoredHash = user.PasswordHash });
        }

        // Dev-only: reset password for a user (hashes and saves)
        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetRequest req)
        {
            if (!_env.IsDevelopment())
                return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Password reset" });
        }
    }

    public class VerifyRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ResetRequest
    {
        public string Username { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
