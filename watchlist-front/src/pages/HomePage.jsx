import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import MediaCard from '../components/MediaCard';
import MediaDetailModal from '../components/MediaDetailModal';
import api from '../services/api';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [watchlistsState, setWatchlistsState] = useState([]);
  const location = useLocation();
  const { user } = useAuth();

  // Cargar géneros una sola vez al montar
  useEffect(() => {
    api.get('/media/genres').then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  // Cargar watchlists del usuario para usar en el modal
  const fetchWatchlists = useCallback(async () => {
    if (!user) {
      setWatchlistsState([]);
      return;
    }
    try {
      const res = await api.get('/watchlist');
      setWatchlistsState(res.data || []);
    } catch (err) {
      console.error('Failed to fetch watchlists', err);
      setWatchlistsState([]);
    }
  }, [user]);

  useEffect(() => {
    // Re-fetch watchlists when user logs in/out
    const t = setTimeout(() => fetchWatchlists(), 0);
    return () => clearTimeout(t);
  }, [fetchWatchlists]);

  // Refetch cada vez que cambian los filtros
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      if (genreFilter) params.genre = genreFilter;
      if (yearFilter) params.year = yearFilter;

      const res = await api.get('/media', { params });
      setMediaItems(res.data);
    } catch {
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, genreFilter, yearFilter]);

  // Debounce búsqueda: solo ejecutar fetch cuando NO estamos viendo una lista específica
  const [viewingListId, setViewingListId] = useState(null);
  const [viewingListName, setViewingListName] = useState(null);

  useEffect(() => {
    if (viewingListId) return;
    const timer = setTimeout(() => fetchMedia(), 350); // Debounce búsqueda de texto
    return () => clearTimeout(timer);
  }, [fetchMedia, viewingListId]);

  // Si se navega desde MyLists con state.listId, mostrar solo esa lista
  useEffect(() => {
    const listId = location?.state?.listId;
    // Si location trae listId lo mostramos, si no lo limpiamos (navegar a Home limpia la vista)
    const t = setTimeout(() => {
      if (listId) setViewingListId(Number(listId));
      else setViewingListId(null);
    }, 0);
    return () => clearTimeout(t);
  }, [location]);

  // Cuando cambian las watchlists o el viewingListId, actualizar los items mostrados
  useEffect(() => {
    if (!viewingListId) return;
    const t = setTimeout(() => {
      const list = watchlistsState.find((w) => Number(w.id) === Number(viewingListId));
      if (list) {
        setMediaItems(list.items || []);
        setViewingListName(list.name);
      } else {
        setMediaItems([]);
        setViewingListName(null);
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(t);
  }, [watchlistsState, viewingListId]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setGenreFilter('');
    setYearFilter('');
  };

  const hasFilters = search || typeFilter || genreFilter || yearFilter;

  return (
    <div className="container-fluid px-4 py-4">
      {/* Search & Filters Bar */}
      <div className="row g-2 mb-4 align-items-center">
        {/* Search Input */}
        <div className="col-12 col-md-4 position-relative">
          <FiSearch
            style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', color: '#808080', pointerEvents: 'none' }}
          />
          <input
            id="search-input"
            type="text"
            className="form-control ps-5"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="col-6 col-md-2">
          <select
            id="type-filter"
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ background: '#333', border: '1px solid #333', color: typeFilter ? '#fff' : '#808080' }}
          >
            <option value="">All types</option>
            <option value="Movie">🎬 Movie</option>
            <option value="Series">📺 Series</option>
          </select>
        </div>

        {/* Genre Filter */}
        <div className="col-6 col-md-2">
          <select
            id="genre-filter"
            className="form-select"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{ background: '#333', border: '1px solid #333', color: genreFilter ? '#fff' : '#808080' }}
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="col-6 col-md-2">
          <input
            id="year-filter"
            type="number"
            className="form-control"
            placeholder="Year..."
            min="1900"
            max="2030"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
        </div>

        {/* Clear Filters */}
        <div className="col-6 col-md-2">
          {hasFilters && (
            <button
              id="clear-filters-btn"
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e5e5' }}
              onClick={clearFilters}
            >
              <FiX /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <p style={{ color: '#808080', fontSize: '0.85rem', margin: 0 }}>
          {viewingListId ? `${mediaItems.length} item${mediaItems.length !== 1 ? 's' : ''} in "${viewingListName}"` : (loading ? 'Searching...' : `${mediaItems.length} result${mediaItems.length !== 1 ? 's' : ''} found`)}
        </p>
        {viewingListId && (
          <div>
            <Link to="/mylists" className="btn btn-outline-secondary btn-sm me-2">Back to lists</Link>
            <button className="btn btn-sm btn-primary" onClick={() => { setViewingListId(null); setViewingListName(null); fetchMedia(); }}>Show all</button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border" style={{ color: '#E50914', width: '3rem', height: '3rem' }} role="status" />
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#555' }}>
          <p style={{ fontSize: '1.1rem' }}>No results found for your search.</p>
          {hasFilters && (
            <button className="btn btn-outline-primary mt-2" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {mediaItems.map((item) => (
            <div key={item.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <MediaCard item={item} onClick={setSelectedItem} />
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          watchlists={watchlistsState}
          onClose={() => setSelectedItem(null)}
          onWatchlistsChanged={fetchWatchlists}
        />
      )}
    </div>
  );
};

export default HomePage;
