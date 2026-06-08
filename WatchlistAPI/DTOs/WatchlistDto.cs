namespace WatchlistAPI.DTOs
{
    public class CreateWatchlistDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class AddPlaylistItemDto
    {
        public int MediaId { get; set; }
    }

    public class WatchlistResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<MediaItemDto> Items { get; set; } = new List<MediaItemDto>();
    }
}
