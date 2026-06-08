using Microsoft.EntityFrameworkCore;
using WatchlistAPI.Models;

namespace WatchlistAPI.Data
{
    public class WatchlistDbContext : DbContext
    {
        public WatchlistDbContext(DbContextOptions<WatchlistDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }
        public DbSet<WatchlistItem> WatchlistItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Key for WatchlistItem
            modelBuilder.Entity<WatchlistItem>()
                .HasKey(wi => new { wi.WatchlistId, wi.MediaId });

            modelBuilder.Entity<WatchlistItem>()
                .HasOne(wi => wi.Watchlist)
                .WithMany(w => w.WatchlistItems)
                .HasForeignKey(wi => wi.WatchlistId);
        }
    }
}
