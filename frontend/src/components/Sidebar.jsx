import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Users, FileText, ClipboardList, CreditCard, Calendar, X as CloseIcon } from 'lucide-react';

export default function Sidebar({ theme, toggleTheme, isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/cotizaciones', name: 'Cotizaciones', icon: FileText },
    { path: '/tickets', name: 'Tickets', icon: ClipboardList },
    { path: '/agenda', name: 'Agenda', icon: Calendar },
    { path: '/cobranza', name: 'Cobranza', icon: CreditCard },
  ];

  // Cerrar sidebar en móvil al hacer clic en un link
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1 className="logo">NexoFix</h1>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Botón de cerrar visible solo en móvil dentro del sidebar como alternativa */}
          <button className="theme-toggle mobile-only-btn" onClick={onClose} style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <CloseIcon size={20} />
          </button>
        </div>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Icon size={20} style={{ marginRight: '12px' }} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
