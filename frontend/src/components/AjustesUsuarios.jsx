import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldAlert, Trash2, Edit2, CheckCircle2, X } from 'lucide-react';

export default function AjustesUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de formulario
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, username: '', password: '', rol: 'tecnico', activo: 1 });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('nexofix_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: '', // En edición está vacío por defecto (para no cambiarla si no se quiere)
      rol: user.rol,
      activo: user.activo
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setFormData({ id: null, username: '', password: '', rol: 'tecnico', activo: 1 });
    setShowModal(true);
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar el usuario "${username}" definitivamente? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem('nexofix_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      loadUsuarios();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const token = localStorage.getItem('nexofix_token');

    try {
      if (formData.id) {
        // Editando
        const payload = { rol: formData.rol, activo: formData.activo, username: formData.username.trim() };
        if (formData.password.trim() !== '') {
          payload.password = formData.password;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');

      } else {
        // Creando
        if (!formData.username || !formData.password) {
          throw new Error('El nombre de usuario y la contraseña son obligatorios');
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password,
            rol: formData.rol
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear');
      }

      setShowModal(false);
      loadUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  return (
    <div className="tab-pane active fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Gestión de Accesos (Usuarios)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Crea credenciales para Técnicos u otros Administradores del sistema NexoFix.</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      {isMobile ? (
        <div className="mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {usuarios.map(u => (
            <div key={u.id} style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', borderLeft: `4px solid ${u.rol === 'admin' ? '#e74c3c' : '#3498db'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{u.username}</strong>
                <span style={{ color: 'var(--text-muted)' }}>#{u.id}</span>
              </div>
              <div style={{ marginBottom: '0.6rem' }}>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                  background: u.rol === 'admin' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                  color: u.rol === 'admin' ? '#e74c3c' : '#3498db'
                }}>
                  {u.rol === 'admin' ? 'Administrador' : 'Técnico de Terreno'}
                </span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {u.activo ?
                  <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: '500' }}><CheckCircle2 size={16} /> Activo</span> :
                  <span style={{ color: '#e74c3c', fontSize: '0.9rem', fontWeight: '500' }}>Suspendido</span>}
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleEdit(u)}>
                  <Edit2 size={16} /> Editar
                </button>
                {u.id !== 1 && (
                  <button className="btn-secondary" style={{ flex: 1, padding: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDelete(u.id, u.username)}>
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
          {usuarios.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>No hay usuarios (Error de base de datos)</div>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol (Perfil)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: u.rol === 'admin' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                      color: u.rol === 'admin' ? '#e74c3c' : '#3498db'
                    }}>
                      {u.rol === 'admin' ? 'Administrador' : 'Técnico de Terreno'}
                    </span>
                  </td>
                  <td>
                    {u.activo ?
                      <span style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Activo</span> :
                      <span style={{ color: '#e74c3c' }}>Suspendido</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleEdit(u)} className="icon-btn" title="Editar"><Edit2 size={18} /></button>
                    {/* Evitar borrar el admin #1 accidentalmente (si fuera necesario podemos blindarlo aqui) */}
                    {u.id !== 1 && (
                      <button onClick={() => handleDelete(u.id, u.username)} className="icon-btn delete" title="Eliminar"><Trash2 size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay usuarios (Error de base de datos)</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{formData.id ? 'Editar Accesos de Usuario' : 'Crear Nuevo Personal'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message" style={{ marginBottom: '1rem', padding: '10px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', borderRadius: '4px', fontSize: '13px' }}>{error}</div>}
              <form id="user-form" onSubmit={handleSave}>

                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Login)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">{formData.id ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={formData.id ? "Dejar en blanco para no cambiar..." : "Mínimo 6 caracteres..."}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!formData.id}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Rol y Permisos</label>
                  <select
                    className="form-control"
                    value={formData.rol}
                    onChange={e => setFormData({ ...formData, rol: e.target.value })}
                    disabled={formData.id === 1} // No permitimos quitarle el admin al root
                  >
                    <option value="tecnico">Técnico (Solo uso móvil para Tickets)</option>
                    <option value="admin">Administrador (Acceso Total Global)</option>
                  </select>
                </div>

                {!!formData.id && formData.id !== 1 && (
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Estado de la cuenta</label>
                    <select
                      className="form-control"
                      value={formData.activo}
                      onChange={e => setFormData({ ...formData, activo: parseInt(e.target.value) })}
                    >
                      <option value={1}>Habilitado (Acceso normal)</option>
                      <option value={0}>Suspendido (No podrá iniciar sesión)</option>
                    </select>
                  </div>
                )}

              </form>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" type="submit" form="user-form" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar y Otorgar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
