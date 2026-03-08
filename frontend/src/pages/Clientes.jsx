import { useState, useEffect } from 'react';
import { clientesService } from '../services/api';
import ClienteForm from '../components/ClienteForm';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClientes();
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
      await clientesService.create(clienteData);
      setShowModal(false);
      loadClientes(); // Reload the list
    } catch (err) {
      throw err; // Form will catch and show error
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h2 className="page-title">Gestión de Clientes</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo Cliente
        </button>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="table-container">
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
                  <td style={{ textAlign: 'right' }}>
                     <button className="btn-secondary">Ver / Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ClienteForm 
          onClose={() => setShowModal(false)} 
          onSave={handleSaveCliente} 
        />
      )}
    </div>
  );
}
