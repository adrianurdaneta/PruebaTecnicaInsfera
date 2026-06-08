import { useState } from 'react';
import { FiStar, FiPlus, FiCheck } from 'react-icons/fi';
import api from '../services/api';

const MediaDetailModal = ({ item, watchlists, onClose, onWatchlistsChanged }) => {
  const [feedback, setFeedback] = useState({}); // { [watchlistId]: 'added' | 'removed' | 'error' }
  const [loading, setLoading] = useState({});
  const [, setError] = useState(null);

  // Skeleton state for poster load - hooks must be at top-level
  const [posterLoaded, setPosterLoaded] = useState(false);

  // Seguridad: normalizar watchlists para evitar null/undefined cuando el padre no lo pasa
  const safeWatchlists = Array.isArray(watchlists) ? watchlists : [];

  // Calcula qué listas ya contienen este item
  const isInWatchlist = (watchlistId) =>
    safeWatchlists.find((w) => w.id === watchlistId)?.items?.some((i) => i.id === item.id);

  const handleToggle = async (watchlistId) => {
    const alreadyIn = isInWatchlist(watchlistId);
    setLoading((prev) => ({ ...prev, [watchlistId]: true }));
    try {
      if (alreadyIn) {
        await api.delete(`/watchlist/${watchlistId}/items/${item.id}`);
        setFeedback((prev) => ({ ...prev, [watchlistId]: 'removed' }));
      } else {
        await api.post(`/watchlist/${watchlistId}/items`, { mediaId: item.id });
        setFeedback((prev) => ({ ...prev, [watchlistId]: 'added' }));
      }
      onWatchlistsChanged(); // Refresca las watchlists del padre
    } catch {
      setFeedback((prev) => ({ ...prev, [watchlistId]: 'error' }));
      setError('Could not update watchlist');
    } finally {
      setLoading((prev) => ({ ...prev, [watchlistId]: false }));
      setTimeout(() => setFeedback((prev) => ({ ...prev, [watchlistId]: null })), 2000);
    }
  };

  if (!item) return null;


  return (
    <div
      className="modal show d-block"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id="media-detail-modal"
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Header with poster */}
          <div
            className="position-relative"
            style={{ height: '280px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}
          >
            {!posterLoaded && (
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            )}
            <img
              src={item.posterUrl || 'https://via.placeholder.com/800x300/1a1a1a/E50914?text=No+Image'}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: posterLoaded ? 'block' : 'none' }}
              onLoad={() => setPosterLoaded(true)}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x300/1a1a1a/E50914?text=No+Image'; setPosterLoaded(true); }}
            />
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(28,28,28,1) 5%, rgba(28,28,28,0.4) 60%, transparent 100%)',
              }}
            />
            <button
              id="modal-close-btn"
              className="btn-close btn-close-white position-absolute"
              style={{ top: '14px', right: '14px', zIndex: 10 }}
              onClick={onClose}
              aria-label="Close"
            />
            <div className="position-absolute bottom-0 start-0 p-4">
              <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>{item.title}</h2>
              <div className="d-flex align-items-center gap-3">
                <span style={{ color: '#f5c518', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiStar fill="#f5c518" /> {item.rating?.toFixed(1)}
                </span>
                <span style={{ color: '#aaa' }}>{item.releaseYear}</span>
                <span style={{ color: '#aaa' }}>{item.duration}</span>
                <span className="badge" style={{ background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.5)', color: '#ff6b6b' }}>
                  {item.type}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Left: Info */}
              <div className="col-md-7">
                <p style={{ color: '#808080', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Director</p>
                <p className="mb-3 fw-500">{item.director}</p>

                <p style={{ color: '#808080', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Synopsis</p>
                <p style={{ color: '#d2d2d2', lineHeight: '1.6', fontSize: '0.95rem' }}>{item.synopsis}</p>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  {item.genres?.map((g) => (
                    <span key={g} className="badge rounded-pill"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e5e5e5', padding: '5px 12px' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Add to Watchlist */}
              <div className="col-md-5">
                <p style={{ color: '#808080', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }} className="mb-3">
                  Add to my lists
                </p>
                {safeWatchlists.length === 0 ? (
                  <p style={{ color: '#555', fontSize: '0.9rem' }}>
                    You have no lists yet. Create one in <strong>My Lists</strong>.
                  </p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {safeWatchlists.map((wl) => {
                      const inList = isInWatchlist(wl.id);
                      const isLoading = loading[wl.id];
                      const fb = feedback[wl.id];
                      return (
                        <button
                          key={wl.id}
                          id={`toggle-watchlist-${wl.id}`}
                          className={`btn btn-sm d-flex align-items-center gap-2 justify-content-between ${inList ? 'btn-primary' : 'btn-outline-secondary'}`}
                          style={!inList ? { borderColor: 'rgba(255,255,255,0.2)', color: '#e5e5e5' } : {}}
                          onClick={() => handleToggle(wl.id)}
                          disabled={isLoading}
                        >
                          <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                            {wl.name}
                          </span>
                          <span>
                            {isLoading ? <span className="spinner-border spinner-border-sm" /> :
                              fb === 'added' ? '✓' :
                              fb === 'removed' ? '−' :
                              inList ? <FiCheck /> : <FiPlus />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailModal;
