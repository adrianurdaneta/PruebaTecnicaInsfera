import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiList, FiGrid } from 'react-icons/fi';

const Navbar = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg netflix-navbar sticky-top px-3 px-lg-5">
      {/* Brand */}
      <span className="navbar-brand">WATCHLIST</span>

      {/* Navigation Tabs */}
      <div className="d-flex align-items-center gap-3 me-auto ms-4">
        <button
          id="nav-catalog-btn"
          className={`btn btn-sm px-3 ${activeView === 'catalog' ? 'btn-primary' : 'btn-outline-secondary'}`}
          style={{ borderColor: activeView !== 'catalog' ? 'rgba(255,255,255,0.2)' : undefined, color: activeView !== 'catalog' ? '#e5e5e5' : undefined }}
          onClick={() => onViewChange('catalog')}
        >
          <FiGrid className="me-1" /> Browse
        </button>
        <button
          id="nav-watchlists-btn"
          className={`btn btn-sm px-3 ${activeView === 'watchlists' ? 'btn-primary' : 'btn-outline-secondary'}`}
          style={{ borderColor: activeView !== 'watchlists' ? 'rgba(255,255,255,0.2)' : undefined, color: activeView !== 'watchlists' ? '#e5e5e5' : undefined }}
          onClick={() => onViewChange('watchlists')}
        >
          <FiList className="me-1" /> My Lists
        </button>
      </div>

      {/* User + Logout */}
      <div className="d-flex align-items-center gap-3">
        <span style={{ color: '#e5e5e5', fontSize: '0.9rem' }}>
          👤 <strong>{user?.username}</strong>
        </span>
        <button
          id="logout-btn"
          className="btn btn-sm btn-outline-secondary"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e5e5' }}
          onClick={logout}
          title="Sign out"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
