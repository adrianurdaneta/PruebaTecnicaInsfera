import './App.css'
import { Link, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MyLists from './pages/MyLists'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg netflix-navbar px-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Watchlist</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/mylists">My Lists</Link>
              </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <button id="logout-btn" className="nav-link btn btn-link" onClick={() => { const evt = new Event('logout-click'); window.dispatchEvent(evt); }}>Logout</button>
            </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/mylists" element={<MyLists />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </main>
    </div>
  )
}

export default App
