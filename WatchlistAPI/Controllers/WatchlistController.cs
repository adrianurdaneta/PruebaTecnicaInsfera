using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using WatchlistAPI.Data;
using WatchlistAPI.DTOs;
using WatchlistAPI.Models;

namespace WatchlistAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Todos los endpoints de listas requieren autenticación JWT
    public class WatchlistController : ControllerBase
    {
        private readonly WatchlistDbContext _context;
        private readonly IDbConnection _dbConnection;

        public WatchlistController(WatchlistDbContext context, IDbConnection dbConnection)
        {
            _context = context;
            _dbConnection = dbConnection;
        }

        // 3b. Actualizar nombre/description de una Watchlist
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWatchlist(int id, [FromBody] CreateWatchlistDto request)
        {
            var userId = GetUserId();
            var watchlist = await _context.Watchlists.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (watchlist == null)
                return NotFound(new { Message = "Watchlist not found or unauthorized." });

            watchlist.Name = request.Name;
            watchlist.Description = request.Description;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Watchlist updated successfully.", watchlist.Id, watchlist.Name, watchlist.Description });
        }

        // 1. Obtener todas las Watchlists del usuario logueado con sus items (Dapper para lectura)
        [HttpGet]
        public async Task<IActionResult> GetUserWatchlists()
        {
            var userId = GetUserId();

            var sql = @"
                SELECT w.id as Id, w.name as Name, w.description as Description, w.created_at as CreatedAt,
                       mi.id as MediaId, mi.title as Title, mi.type as Type, mi.release_year as ReleaseYear, 
                       mi.poster_url as PosterUrl, mi.rating as Rating, mi.duration as Duration
                FROM watchlists w
                LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
                LEFT JOIN media_items mi ON wi.media_id = mi.id
                WHERE w.user_id = @UserId
                ORDER BY w.created_at DESC";

            var watchlistDict = new Dictionary<int, WatchlistResponseDto>();

            await _dbConnection.QueryAsync<WatchlistResponseDto, WatchlistDapperRow, WatchlistResponseDto>(
                sql,
                (watchlist, mediaItem) =>
                {
                    if (!watchlistDict.TryGetValue(watchlist.Id, out var existingWatchlist))
                    {
                        existingWatchlist = watchlist;
                        existingWatchlist.Items = new List<MediaItemDto>();
                        watchlistDict.Add(watchlist.Id, existingWatchlist);
                    }

                    if (mediaItem != null && mediaItem.MediaId.HasValue)
                    {
                        var itemDto = new MediaItemDto
                        {
                            Id = mediaItem.MediaId.Value,
                            Title = mediaItem.Title ?? string.Empty,
                            Type = mediaItem.Type ?? string.Empty,
                            ReleaseYear = mediaItem.ReleaseYear ?? 0,
                            PosterUrl = mediaItem.PosterUrl ?? string.Empty,
                            Rating = mediaItem.Rating ?? 0,
                            Duration = mediaItem.Duration ?? string.Empty
                        };
                        existingWatchlist.Items.Add(itemDto);
                    }

                    return existingWatchlist;
                },
                new { UserId = userId },
                splitOn: "MediaId"
            );

            return Ok(watchlistDict.Values);
        }

        // 2. Crear una nueva Watchlist (EF Core para escritura)
        [HttpPost]
        public async Task<IActionResult> CreateWatchlist([FromBody] CreateWatchlistDto request)
        {
            var userId = GetUserId();

            var watchlist = new Watchlist
            {
                UserId = userId,
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Watchlists.Add(watchlist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserWatchlists), new { id = watchlist.Id }, new { watchlist.Id, watchlist.Name, watchlist.Description });
        }

        // 3. Eliminar una Watchlist (EF Core para escritura/borrado)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWatchlist(int id)
        {
            var userId = GetUserId();
            var watchlist = await _context.Watchlists.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (watchlist == null)
                return NotFound(new { Message = "Watchlist not found or unauthorized." });

            _context.Watchlists.Remove(watchlist);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Watchlist deleted successfully." });
        }

        // 4. Añadir una película/serie a una Watchlist (EF Core para escritura)
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItemToWatchlist(int id, [FromBody] AddPlaylistItemDto request)
        {
            var userId = GetUserId();

            // Verificar que la lista pertenece al usuario
            var watchlistExists = await _context.Watchlists.AnyAsync(w => w.Id == id && w.UserId == userId);
            if (!watchlistExists)
                return NotFound(new { Message = "Watchlist not found or unauthorized." });

            // Verificar si ya existe el elemento en la lista
            var alreadyInList = await _context.WatchlistItems
                .AnyAsync(wi => wi.WatchlistId == id && wi.MediaId == request.MediaId);

            if (alreadyInList)
                return BadRequest(new { Message = "This content is already in your watchlist." });

            var item = new WatchlistItem
            {
                WatchlistId = id,
                MediaId = request.MediaId,
                AddedAt = DateTime.UtcNow
            };

            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Content added to watchlist successfully." });
        }

        // 5. Eliminar una película/serie de una Watchlist (EF Core para escritura)
        [HttpDelete("{id}/items/{mediaId}")]
        public async Task<IActionResult> RemoveItemFromWatchlist(int id, int mediaId)
        {
            var userId = GetUserId();

            // Verificar que la lista pertenece al usuario
            var watchlistExists = await _context.Watchlists.AnyAsync(w => w.Id == id && w.UserId == userId);
            if (!watchlistExists)
                return NotFound(new { Message = "Watchlist not found or unauthorized." });

            var item = await _context.WatchlistItems
                .FirstOrDefaultAsync(wi => wi.WatchlistId == id && wi.MediaId == mediaId);

            if (item == null)
                return NotFound(new { Message = "Content not found in this watchlist." });

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Content removed from watchlist successfully." });
        }

        private int GetUserId()
        {
            var claim = User.FindFirst("id") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null) throw new UnauthorizedAccessException("User is not authenticated.");
            return int.Parse(claim.Value);
        }
    }

    public class WatchlistDapperRow
    {
        public int? MediaId { get; set; }
        public string? Title { get; set; }
        public string? Type { get; set; }
        public int? ReleaseYear { get; set; }
        public string? PosterUrl { get; set; }
        public decimal? Rating { get; set; }
        public string? Duration { get; set; }
    }
}
