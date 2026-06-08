import { useState } from 'react';
import { FiPlus, FiTrash2, FiFilm, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';

const WatchlistPanel = ({ watchlists, onChanged }) => {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post('/watchlist', { name: newName.trim(), description: newDesc.trim() || null });
      setNewName('');
      setNewDesc('');
      setShowForm(false);
      onChanged();
    } catch {
      // handle silently
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this watchlist?')) return;
    try {
      await api.delete(`/watchlist/${id}`);
      onChanged();
    } catch {
      // handle silently
    }
  };

  const handleRemoveItem = async (watchlistId, mediaId) => {
    try {
      await api.delete(`/watchlist/${watchlistId}/items/${mediaId}`);
      onChanged();
    } catch {
      // handle silently
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0">My Watchlists</h4>
          <p style={{ color: '#808080', fontSize: '0.88rem' }} className="mb-0">
            {watchlists.length} list{watchlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          id="create-watchlist-btn"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowForm((v) => !v)}
        >
          <FiPlus /> New List
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-3 rounded" style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mb-2">
            <input
              id="watchlist-name-input"
              type="text"
              className="form-control"
              placeholder="List name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              id="watchlist-desc-input"
              type="text"
              className="form-control"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button id="watchlist-submit-btn" type="submit" className="btn btn-primary btn-sm" disabled={creating}>
              {creating ? <span className="spinner-border spinner-border-sm me-1" /> : null}
              Create
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e5e5' }} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Watchlists */}
      {watchlists.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#555' }}>
          <FiFilm size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No lists yet. Create your first one!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {watchlists.map((wl) => (
            <div key={wl.id} className="watchlist-panel" id={`watchlist-card-${wl.id}`}>
              {/* Watchlist Header */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div
                  className="d-flex align-items-center gap-2"
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => setExpandedId(expandedId === wl.id ? null : wl.id)}
                >
                  <div>
                    <p className="fw-600 mb-0" style={{ fontWeight: 600 }}>{wl.name}</p>
                    {wl.description && (
                      <p style={{ color: '#808080', fontSize: '0.8rem', marginBottom: 0 }}>{wl.description}</p>
                    )}
                  </div>
                  <span style={{ color: '#808080', fontSize: '0.8rem', marginLeft: '8px' }}>
                    ({wl.items?.length ?? 0} items)
                  </span>
                  <span style={{ color: '#808080', marginLeft: 'auto' }}>
                    {expandedId === wl.id ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </div>
                <button
                  id={`delete-watchlist-${wl.id}`}
                  className="btn btn-sm ms-2"
                  style={{ color: '#666', border: 'none', background: 'transparent' }}
                  onClick={() => handleDelete(wl.id)}
                  title="Delete watchlist"
                >
                  <FiTrash2 />
                </button>
              </div>

              {/* Expandable Items List */}
              {expandedId === wl.id && (
                <div className="mt-2">
                  {wl.items?.length === 0 ? (
                    <p style={{ color: '#555', fontSize: '0.85rem' }}>No content yet. Browse and add from the catalog!</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {wl.items?.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex align-items-center gap-3 p-2 rounded"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <img
                            src={item.posterUrl}
                            alt={item.title}
                            style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40x60/1a1a1a/E50914?text=?'; }}
                          />
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p className="mb-0 fw-500" style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </p>
                            <small style={{ color: '#808080' }}>{item.type} · {item.releaseYear}</small>
                          </div>
                          <button
                            id={`remove-item-${wl.id}-${item.id}`}
                            className="btn btn-sm"
                            style={{ color: '#666', border: 'none', background: 'transparent' }}
                            onClick={() => handleRemoveItem(wl.id, item.id)}
                            title="Remove from list"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPanel;
