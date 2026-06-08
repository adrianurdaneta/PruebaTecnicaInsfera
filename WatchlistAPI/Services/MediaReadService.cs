using Dapper;
using SqlKata;
using SqlKata.Compilers;
using System.Data;
using WatchlistAPI.DTOs;

namespace WatchlistAPI.Services
{
    public interface IMediaReadService
    {
        Task<IEnumerable<MediaItemDto>> GetMediaItemsAsync(string? search, string? type, string? genre, int? year);
        Task<MediaItemDto?> GetMediaItemByIdAsync(int id);
        Task<IEnumerable<GenreDto>> GetGenresAsync();
    }

    public class MediaReadService : IMediaReadService
    {
        private readonly IDbConnection _dbConnection;
        private readonly Compiler _compiler;

        public MediaReadService(IDbConnection dbConnection, Compiler compiler)
        {
            _dbConnection = dbConnection;
            _compiler = compiler;
        }

        public async Task<IEnumerable<MediaItemDto>> GetMediaItemsAsync(string? search, string? type, string? genre, int? year)
        {
            // 1. Build base query with SqlKata
            var query = new Query("media_items as m")
                .Select("m.id", "m.title", "m.type", "m.release_year as ReleaseYear", "m.director", "m.synopsis", "m.poster_url as PosterUrl", "m.rating", "m.duration");

            // Filter by genre if provided (requires JOIN)
            if (!string.IsNullOrWhiteSpace(genre))
            {
                query = query.Join("media_genres as mg", "m.id", "mg.media_id")
                             .Join("genres as g", "mg.genre_id", "g.id")
                             .Where("g.name", genre);
            }

            // Filter by text search in title
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.WhereLike("m.title", $"%{search}%");
            }

            // Filter by type (Movie/Series)
            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where("m.type", type);
            }

            // Filter by year
            if (year.HasValue)
            {
                query = query.Where("m.release_year", year.Value);
            }

            // Compile query and execute with Dapper
            var compiled = _compiler.Compile(query);
            // Ensure connection is open only if not already open (for IDbConnection implementations that require it)
            if (_dbConnection is System.Data.Common.DbConnection conn && conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }
            var items = (await _dbConnection.QueryAsync<MediaItemDto>(compiled.Sql, compiled.NamedBindings)).ToList();

            // 2. If movies are found, load their associated genres efficiently
            if (items.Any())
            {
                var itemIds = items.Select(i => i.Id).ToList();

                var genreQuery = new Query("media_genres as mg")
                    .Join("genres as g", "mg.genre_id", "g.id")
                    .Select("mg.media_id as MediaId", "g.name as GenreName")
                    .WhereIn("mg.media_id", itemIds);

                var compiledGenres = _compiler.Compile(genreQuery);
                if (_dbConnection is System.Data.Common.DbConnection conn2 && conn2.State != System.Data.ConnectionState.Open)
                {
                    await conn2.OpenAsync();
                }
                var genreMappings = await _dbConnection.QueryAsync<dynamic>(compiledGenres.Sql, compiledGenres.NamedBindings);

                // Group genres by media item ID
                var genreDict = new Dictionary<int, List<string>>();
                foreach (var row in genreMappings)
                {
                    int mediaId = (int)row.MediaId;
                    string genreName = (string)row.GenreName;

                    if (!genreDict.ContainsKey(mediaId))
                    {
                        genreDict[mediaId] = new List<string>();
                    }
                    genreDict[mediaId].Add(genreName);
                }

                // Assign genres to the final DTO list
                foreach (var item in items)
                {
                    if (genreDict.TryGetValue(item.Id, out var genresList))
                    {
                        item.Genres = genresList;
                    }
                }
            }

            return items;
        }

        public async Task<MediaItemDto?> GetMediaItemByIdAsync(int id)
        {
            var query = new Query("media_items as m")
                .Select("m.id", "m.title", "m.type", "m.release_year as ReleaseYear", "m.director", "m.synopsis", "m.poster_url as PosterUrl", "m.rating", "m.duration")
                .Where("m.id", id);

            var compiled = _compiler.Compile(query);
            if (_dbConnection is System.Data.Common.DbConnection conn3 && conn3.State != System.Data.ConnectionState.Open)
            {
                await conn3.OpenAsync();
            }
            var item = await _dbConnection.QueryFirstOrDefaultAsync<MediaItemDto>(compiled.Sql, compiled.NamedBindings);

            if (item != null)
            {
                var genreQuery = new Query("media_genres as mg")
                    .Join("genres as g", "mg.genre_id", "g.id")
                    .Select("g.name")
                    .Where("mg.media_id", id);

                var compiledGenres = _compiler.Compile(genreQuery);
                if (_dbConnection is System.Data.Common.DbConnection conn4 && conn4.State != System.Data.ConnectionState.Open)
                {
                    await conn4.OpenAsync();
                }
                var genres = await _dbConnection.QueryAsync<string>(compiledGenres.Sql, compiledGenres.NamedBindings);
                item.Genres = genres.ToList();
            }

            return item;
        }

        public async Task<IEnumerable<GenreDto>> GetGenresAsync()
        {
            var query = new Query("genres")
                .Select("id", "name");

            var compiled = _compiler.Compile(query);
            if (_dbConnection is System.Data.Common.DbConnection conn5 && conn5.State != System.Data.ConnectionState.Open)
            {
                await conn5.OpenAsync();
            }
            return await _dbConnection.QueryAsync<GenreDto>(compiled.Sql, compiled.NamedBindings);
        }
    }
}
