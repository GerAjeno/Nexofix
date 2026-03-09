import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Users, FileText, ClipboardList, CreditCard, Calendar, Settings } from 'lucide-react';

export default function Sidebar({ theme, toggleTheme, isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/cotizaciones', name: 'Cotizaciones', icon: FileText },
    { path: '/tickets', name: 'Tickets', icon: ClipboardList },
    { path: '/agenda', name: 'Agenda', icon: Calendar },
    { path: '/cobranzas', name: 'Cobranzas', icon: CreditCard },
    { path: '/ajustes', name: 'Ajustes', icon: Settings },
  ];

  // Cerrar sidebar en móvil al hacer clic en un link
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
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
              <Icon size={20} className="nav-icon" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
