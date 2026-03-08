import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, X as CloseIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cotizaciones from './pages/Cotizaciones';
import Tickets from './pages/Tickets';

function App() {
  // Use dark mode by default
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
        {/* Mobile Header with Sandwich Button */}
        <header className="mobile-header">
          <h1 className="logo" style={{ fontSize: '1.25rem' }}>NexoFix</h1>
          <button className="menu-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
        )}

        <Sidebar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className={`main-layout ${!isSidebarOpen ? 'full-width' : ''}`}>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/tickets" element={<Tickets />} />
              {/* Add other routes here later */}
              <Route path="/agenda" element={<div className="card"><h2 className="page-title">Agenda</h2><p className="page-subtitle">Módulo en construcción</p></div>} />
              <Route path="/cobranza" element={<div className="card"><h2 className="page-title">Cobranza</h2><p className="page-subtitle">Módulo en construcción</p></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
