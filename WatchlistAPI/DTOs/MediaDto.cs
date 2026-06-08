namespace WatchlistAPI.DTOs
{
    public class MediaItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int ReleaseYear { get; set; }
        public string Director { get; set; } = string.Empty;
        public string Synopsis { get; set; } = string.Empty;
        public string PosterUrl { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public string Duration { get; set; } = string.Empty;
        public List<string> Genres { get; set; } = new List<string>();
    }

    public class GenreDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
