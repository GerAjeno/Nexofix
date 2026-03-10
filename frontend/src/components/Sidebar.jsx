import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Users, FileText, ClipboardList, CreditCard, Calendar, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar({ theme, toggleTheme, isOpen, onClose }) {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Filtrar los items en base al rol
  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/clientes', name: 'Clientes', icon: Users, roles: ['admin'] },
    { path: '/cotizaciones', name: 'Cotizaciones', icon: FileText, roles: ['admin'] },
    { path: '/tickets', name: 'Tickets', icon: ClipboardList, roles: ['admin', 'tecnico'] },
    { path: '/agenda', name: 'Agenda', icon: Calendar, roles: ['admin'] },
    { path: '/cobranzas', name: 'Cobranzas', icon: CreditCard, roles: ['admin'] },
    { path: '/ajustes', name: 'Ajustes', icon: Settings, roles: ['admin'] },
  ].filter(item => user && item.roles.includes(user.rol));

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
