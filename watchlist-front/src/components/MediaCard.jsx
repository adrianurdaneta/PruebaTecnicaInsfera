import { FiStar } from 'react-icons/fi';

const MediaCard = ({ item, onClick }) => {
  const placeholder = 'https://via.placeholder.com/300x450/1a1a1a/E50914?text=No+Image';

  const handleError = (e) => {
    // Evitar loops infinitos si el placeholder también falla
    if (e.target.dataset.fallback) return;
    e.target.dataset.fallback = '1';
    e.target.src = placeholder;
    e.target.classList.remove('loading');
  };

  return (
    <div className="media-card h-100" onClick={() => onClick(item)} id={`media-card-${item.id}`}>
      <div className="card-img-wrapper">
        <img
          src={item.posterUrl || placeholder}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="loading"
          onError={handleError}
        />
        {/* Type Badge: Movie or Series */}
        <span className="media-badge">{item.type === 'Movie' ? '🎬 Movie' : '📺 Series'}</span>

        {/* Rating overlay on hover */}
        <div
          className="position-absolute bottom-0 start-0 end-0 px-2 pb-1 pt-3"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          <div className="d-flex align-items-center gap-1" style={{ color: '#f5c518', fontSize: '0.8rem' }}>
            <FiStar fill="#f5c518" />
            <span>{item.rating?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="media-card-body">
        <p className="media-card-title mb-1">{item.title}</p>
        <div className="d-flex align-items-center justify-content-between">
          <small style={{ color: '#808080', fontSize: '0.78rem' }}>{item.releaseYear}</small>
          <div className="d-flex gap-1 flex-wrap justify-content-end">
            {item.genres?.slice(0, 2).map((g) => (
              <span
                key={g}
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  background: 'rgba(229,9,20,0.15)',
                  border: '1px solid rgba(229,9,20,0.3)',
                  borderRadius: '4px',
                  color: '#e5e5e5',
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
