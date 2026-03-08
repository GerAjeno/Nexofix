import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Cotizaciones from './pages/Cotizaciones';

function App() {
  // Use dark mode by default
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />

        <div className="main-layout">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              {/* Add other routes here later */}
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/tickets" element={<div className="card"><h2 className="page-title">Tickets</h2><p className="page-subtitle">Módulo en construcción</p></div>} />
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
