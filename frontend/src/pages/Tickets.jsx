import { useState, useEffect } from 'react';
import { Plus, Archive, ExternalLink, Filter } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';
import TicketForm from '../components/TicketForm';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await ticketsService.getAll();
      setTickets(data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleArchive = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas archivar este ticket?')) {
      try {
        await ticketsService.delete(id);
        fetchTickets();
      } catch (error) {
        alert('Error al archivar el ticket');
      }
    }
  };

  const getStatusBadge = (estado) => {
    const styles = {
      'Pendiente': { bg: '#fef3c7', color: '#92400e' },
      'En Proceso': { bg: '#dcfce7', color: '#166534' },
      'Terminado': { bg: '#d1fae5', color: '#065f46' },
      'Cancelado': { bg: '#fee2e2', color: '#991b1b' }
    };
    const style = styles[estado] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span style={{ 
        padding: '2px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {estado}
      </span>
    );
  };

  const getPriorityBadge = (prioridad) => {
    const styles = {
      'Alta': { border: '2px solid #ef4444', color: '#ef4444' },
      'Media': { border: '2px solid #f59e0b', color: '#f59e0b' },
      'Baja': { border: '2px solid #10b981', color: '#10b981' }
    };
    const style = styles[prioridad] || { border: '2px solid #6b7280', color: '#6b7280' };
    return (
      <span style={{ 
        padding: '0px 6px', 
        borderRadius: '4px', 
        fontSize: '11px', 
        fontWeight: 'bold',
        border: style.border,
        color: style.color,
        marginLeft: '8px'
      }}>
        {prioridad.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Trabajos (Tickets)</h1>
          <p className="page-subtitle">Gestión de órdenes de servicio técnico</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedTicket(null); setShowForm(true); }}>
          <Plus size={20} style={{ marginRight: '8px' }} />
          Nuevo Trabajo
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando trabajos...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Ticket</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td><strong>{ticket.numero_ticket}</strong></td>
                    <td>{new Date(ticket.fecha_creacion + 'T12:00:00').toLocaleDateString('es-CL')}</td>
                    <td>{ticket.cliente_nombre}</td>
                    <td>{getStatusBadge(ticket.estado)}</td>
                    <td>{getPriorityBadge(ticket.prioridad)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" title="Editar" onClick={() => { setSelectedTicket(ticket); setShowForm(true); }}>
                        <ExternalLink size={18} />
                      </button>
                      <button className="icon-btn delete" title="Archivar" onClick={() => handleArchive(ticket.id)}>
                        <Archive size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay trabajos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TicketForm 
          ticket={selectedTicket} 
          onClose={() => setShowForm(false)} 
          onSave={() => { setShowForm(false); fetchTickets(); }} 
        />
      )}
    </div>
  );
}
