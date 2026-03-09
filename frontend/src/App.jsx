import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cotizaciones from './pages/Cotizaciones';
import Tickets from './pages/Tickets';
import Agenda from './pages/Agenda';
import Cobranzas from './pages/Cobranzas';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

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
    <Router>
      <div className="app-container">
        {/* Cabecera Universal (Siempre visible) */}
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
          
          <button onClick={toggleTheme} className="theme-toggle" title="Cambiar Tema">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="app-body">
          {/* Overlay para móviles */}
          {isSidebarOpen && window.innerWidth <= 768 && (
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          )}

          <Sidebar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />

          <div className="main-layout">
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/cotizaciones" element={<Cotizaciones />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/cobranzas" element={<Cobranzas />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
