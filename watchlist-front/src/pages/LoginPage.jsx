import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { id, username: name, token } = response.data;
      login({ id, username: name }, token);
      // Navegar a Home tras login exitoso
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <h1 className="text-center mb-4" style={{ color: '#E50914', fontWeight: 700, fontSize: '2.2rem', letterSpacing: '2px' }}>
          WATCHLIST
        </h1>
        <p className="text-center mb-4" style={{ color: '#8c8c8c', fontSize: '0.9rem' }}>
          Sign in to manage your lists
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2" role="alert" style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.4)', color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ color: '#8c8c8c', fontSize: '0.8rem' }}>
          Demo credentials: <strong style={{ color: '#e5e5e5' }}>user1</strong> / <strong style={{ color: '#e5e5e5' }}>password123</strong>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
