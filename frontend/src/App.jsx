import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <h1 className="logo">NexoFix</h1>
            <nav>
              <ul className="nav-links">
                <li><a href="/">Dashboard</a></li>
                <li><a href="/clientes">Clientes</a></li>
                {/* <li><a href="/cotizaciones">Cotizaciones</a></li> */}
              </ul>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            {/* Add other routes here later */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
