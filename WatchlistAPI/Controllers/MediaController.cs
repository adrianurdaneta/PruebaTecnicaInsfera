using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WatchlistAPI.Services;

namespace WatchlistAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protect media catalog endpoints with JWT
    public class MediaController : ControllerBase
    {
        private readonly IMediaReadService _mediaReadService;

        public MediaController(IMediaReadService mediaReadService)
        {
            _mediaReadService = mediaReadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMediaItems(
            [FromQuery] string? search,
            [FromQuery] string? type,
            [FromQuery] string? genre,
            [FromQuery] int? year)
        {
            var items = await _mediaReadService.GetMediaItemsAsync(search, type, genre, year);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMediaItemById(int id)
        {
            var item = await _mediaReadService.GetMediaItemByIdAsync(id);
            if (item == null)
                return NotFound(new { Message = "Content not found." });

            return Ok(item);
        }

        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres()
        {
            var genres = await _mediaReadService.GetGenresAsync();
            return Ok(genres);
        }
    }
}
