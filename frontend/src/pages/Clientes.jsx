import { useState, useEffect } from 'react';
import { clientesService } from '../services/api';
import ClienteForm from '../components/ClienteForm';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    loadClientes();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCliente = async (clienteData) => {
    try {
      if (selectedCliente) {
        await clientesService.update(selectedCliente.id, clienteData);
      } else {
        await clientesService.create(clienteData);
      }
      setShowModal(false);
      loadClientes(); // Recargar la lista
    } catch (err) {
      throw err; // El formulario capturará y mostrará el error
    }
  };

  const handleDeleteCliente = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar (archivar) al cliente "${nombre}"?`)) {
      try {
        await clientesService.delete(id);
        loadClientes();
      } catch (err) {
        setError(err.message || 'Error al archivar cliente');
      }
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h2 className="page-title">Gestión de Clientes</h2>
        <button className="btn-primary" onClick={() => { setSelectedCliente(null); setShowModal(true); }}>
          + Nuevo Cliente
        </button>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="table-container" style={{ display: isMobile ? 'none' : 'block' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Tipo</th>
              <th>Teléfono</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay clientes registrados</td>
              </tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td style={{ fontWeight: 500 }}>{cliente.nombre}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{cliente.rut}</td>
                  <td>
                    <span className="badge">
                      {cliente.tipo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{cliente.telefono}</td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                     <button className="btn-secondary" onClick={() => { setSelectedCliente(cliente); setShowModal(true); }}>Ver / Editar</button>
                     <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDeleteCliente(cliente.id, cliente.nombre)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isMobile && (
        <div className="mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando...</div>
          ) : clientes.length > 0 ? (
            clientes.map(cliente => (
              <div key={cliente.id} style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>{cliente.nombre}</strong>
                  <span className="badge" style={{ whiteSpace: 'nowrap' }}>{cliente.tipo}</span>
                </div>
                <div style={{ marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <strong>RUT:</strong> {cliente.rut}
                </div>
                <div style={{ marginBottom: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <strong>Teléfono:</strong> {cliente.telefono}
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => { setSelectedCliente(cliente); setShowModal(true); }}>Ver / Editar</button>
                  <button className="btn-secondary" style={{ flex: 1, padding: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDeleteCliente(cliente.id, cliente.nombre)}>Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>No hay clientes registrados</div>
          )}
        </div>
      )}

      {showModal && (
        <ClienteForm 
          cliente={selectedCliente}
          onClose={() => setShowModal(false)} 
          onSave={handleSaveCliente} 
        />
      )}
    </div>
  );
}
