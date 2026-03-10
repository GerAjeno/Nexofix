import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    // Si no hay usuario logueado, expulsar al Login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si no tiene el rol permitido, redirigir a su lugar seguro
    return <Navigate to={user.rol === 'tecnico' ? '/tickets' : '/'} replace />;
  }

  return children;
}
