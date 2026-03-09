import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cotizaciones from './pages/Cotizaciones';
import Tickets from './pages/Tickets';
import Agenda from './pages/Agenda';
import Cobranzas from './pages/Cobranzas';
import Ajustes from './pages/Ajustes';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Componente Wrapper para condicionalmente renderizar Layout
function AppLayout() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      {/* Cabecera Universal (Siempre visible solo si está logueado) */}
      {user && (
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/logo.png" alt="NexoFix Logo" style={{ height: '40px', width: 'auto' }} />
              <h1 className="logo" style={{ fontSize: '1.5rem', marginBottom: 0 }}>NexoFix</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'none', '@media(minWidth: 768px)': { display: 'block' }, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Acceso: <strong>{user.username}</strong>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={toggleTheme} className="theme-toggle" title="Cambiar Tema">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={logout} 
                className="theme-toggle" 
                title="Cerrar Sesión"
                style={{ color: '#e74c3c' }}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="app-body">
        {/* Overlay para móviles */}
        {isSidebarOpen && window.innerWidth <= 768 && user && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}

        {user && (
          <Sidebar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}

        <div className={user ? "main-layout" : ""} style={{ width: '100%' }}>
          <main className={user ? "main-content" : ""} style={{ minHeight: '100vh', padding: user ? undefined : 0, transition: 'none' }}>
            <Routes>
              {/* Ruta Pública */}
              <Route path="/login" element={<Login />} />

              {/* Rutas Protegidas */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
              <Route path="/cotizaciones" element={<ProtectedRoute><Cotizaciones /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
              <Route path="/cobranzas" element={<ProtectedRoute><Cobranzas /></ProtectedRoute>} />
              <Route path="/ajustes" element={<ProtectedRoute><Ajustes /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
