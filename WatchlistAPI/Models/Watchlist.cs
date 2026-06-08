using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchlistAPI.Models
{
    [Table("watchlists")]
    public class Watchlist
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public User? User { get; set; }
        public ICollection<WatchlistItem> WatchlistItems { get; set; } = new List<WatchlistItem>();
    }
}
