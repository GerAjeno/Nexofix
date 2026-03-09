import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Edit2, Archive, Calendar, CheckCircle } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';
import TicketForm from '../components/TicketForm';
import TicketPDF from '../components/TicketPDF';
import ScheduleModal from '../components/ScheduleModal';
import TicketDetailModal from '../components/TicketDetailModal';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  
  // Estados para Detalle/Terminar
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [finishMode, setFinishMode] = useState(false);

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

  const handleOpenOT = async (ticketId) => {
    try {
      const data = await ticketsService.getById(ticketId);
      setPdfData(data);
    } catch (err) {
      console.error(err);
      alert('Error cargando los detalles para la OT');
    }
  };
  const getStatusBadge = (estado) => {
    const styles = {
      'Pendiente': { bg: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }, // Amarillo
      'En Proceso': { bg: 'rgba(40, 167, 69, 0.2)', color: '#28a745' }, // Verde (Solicitado)
      'Terminado': { bg: 'rgba(0, 123, 255, 0.2)', color: '#007bff' },  // Azul
      'Cancelado': { bg: 'rgba(220, 53, 69, 0.2)', color: '#dc3545' }
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
                <th>Proyecto</th>
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
                    <td style={{ color: 'var(--primary)', fontWeight: '500' }}>{ticket.proyecto_nombre || '-'}</td>
                    <td>{ticket.cliente_nombre}</td>
                    <td>{getStatusBadge(ticket.estado)}</td>
                    <td>{getPriorityBadge(ticket.prioridad)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: '4px', justifyContent: 'end' }}>
                        <button className="icon-btn" title="Imprimir Orden de Trabajo" onClick={() => handleOpenOT(ticket.id)}>
                          <Printer size={18} />
                        </button>
                        <button className="icon-btn" title="Agendar Trabajo" onClick={() => { setSelectedForSchedule(ticket); setShowScheduleModal(true); }}>
                          <Calendar size={18} style={{ color: 'var(--primary)' }} />
                        </button>
                        {ticket.estado !== 'Terminado' && (
                          <button className="icon-btn" title="Terminar Trabajo" style={{ color: '#28a745' }} onClick={() => { 
                            setSelectedTicketId(ticket.id);
                            setFinishMode(true);
                            setShowDetail(true);
                          }}>
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="icon-btn" title="Editar" onClick={() => { setSelectedTicket(ticket); setShowForm(true); }}>
                          <Edit2 size={18} />
                        </button>
                        <button className="icon-btn" title="Ver Detalle" onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setFinishMode(false);
                          setShowDetail(true);
                        }}>
                          <Plus size={18} style={{ transform: 'rotate(45deg)', opacity: 0.6 }} />
                        </button>
                        <button className="icon-btn delete" title="Archivar" onClick={() => handleArchive(ticket.id)}>
                          <Archive size={18} />
                        </button>
                      </div>
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

      {pdfData && (
        <TicketPDF 
          data={pdfData} 
          onClose={() => setPdfData(null)} 
        />
      )}

      {showScheduleModal && selectedForSchedule && (
        <ScheduleModal 
          ticket={selectedForSchedule} 
          onClose={() => { setShowScheduleModal(false); setSelectedForSchedule(null); }} 
          onSave={fetchTickets} 
        />
      )}

      {showDetail && selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId}
          initialIsFinishing={finishMode}
          onClose={() => {
            setShowDetail(false);
            setSelectedTicketId(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}
