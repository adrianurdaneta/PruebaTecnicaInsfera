using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchlistAPI.Models
{
    [Table("watchlist_items")]
    public class WatchlistItem
    {
        [Column("watchlist_id")]
        public int WatchlistId { get; set; }

        [Column("media_id")]
        public int MediaId { get; set; }

        [Column("added_at")]
        public DateTime AddedAt { get; set; }

        // Navigation properties
        public Watchlist? Watchlist { get; set; }
    }
}
