import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Escuchar evento global de logout-click para invocar el método del contexto (vía evento)
window.addEventListener('logout-click', () => {
  // Simplely clear localStorage and reload (AuthContext.logoutAndRedirect también hace redirect)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
});
