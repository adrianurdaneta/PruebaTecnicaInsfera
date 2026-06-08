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
    [Authorize] // All watchlist endpoints require JWT authentication
    public class WatchlistController : ControllerBase
    {
        private readonly WatchlistDbContext _context;
        private readonly IDbConnection _dbConnection;

        public WatchlistController(WatchlistDbContext context, IDbConnection dbConnection)
        {
            _context = context;
            _dbConnection = dbConnection;
        }

        // Update watchlist name and description
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

        // Get all watchlists for the logged-in user with their items (using Dapper for read)
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

        // Create a new watchlist (using EF Core for write)
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

        // Delete a watchlist (using EF Core for write/delete)
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

        // Add a movie/series to a watchlist (using EF Core for write)
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItemToWatchlist(int id, [FromBody] AddPlaylistItemDto request)
        {
            var userId = GetUserId();

            // Verify that the watchlist belongs to the user
            var watchlistExists = await _context.Watchlists.AnyAsync(w => w.Id == id && w.UserId == userId);
            if (!watchlistExists)
                return NotFound(new { Message = "Watchlist not found or unauthorized." });

            // Check if the item already exists in the list
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

        // Remove a movie/series from a watchlist (using EF Core for write)
        [HttpDelete("{id}/items/{mediaId}")]
        public async Task<IActionResult> RemoveItemFromWatchlist(int id, int mediaId)
        {
            var userId = GetUserId();

            // Verify that the watchlist belongs to the user
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
