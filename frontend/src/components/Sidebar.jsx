import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Users, FileText, ClipboardList, CreditCard, Calendar } from 'lucide-react';

export default function Sidebar({ theme, toggleTheme }) {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/cotizaciones', name: 'Cotizaciones', icon: FileText },
    { path: '/tickets', name: 'Tickets', icon: ClipboardList },
    { path: '/agenda', name: 'Agenda', icon: Calendar },
    { path: '/cobranza', name: 'Cobranza', icon: CreditCard },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">NexoFix</h1>
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
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
