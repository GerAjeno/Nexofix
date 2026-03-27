import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Phone, Clipboard, FileText, AlertCircle, User } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';

export default function TicketDetailModal({ ticketId, onClose, initialIsFinishing = false }) {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modo finalizar
  const [isFinishing, setIsFinishing] = useState(initialIsFinishing);
  const [finishDate, setFinishDate] = useState('');
  const [finishNotes, setFinishNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const data = await ticketsService.getById(ticketId);
        setTicket(data);
      } catch (err) {
        console.error("Error cargando detalle:", err);
        setError("No se pudo cargar la información del trabajo.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [ticketId]);

  // Si se abre en modo finalizar, pre-poblar datos una vez cargado el ticket
  useEffect(() => {
    if (initialIsFinishing && ticket && !finishDate) {
      const hoy = new Date();
      const d = String(hoy.getDate()).padStart(2, '0');
      const m = String(hoy.getMonth() + 1).padStart(2, '0');
      const y = hoy.getFullYear();
      setFinishDate(`${d}/${m}/${y}`);
      setFinishNotes(ticket.notas_tecnicas || '');
    }
  }, [initialIsFinishing, ticket]);

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length >= 2) {
      const day = parseInt(value.slice(0, 2));
      if (day > 31) value = '31' + value.slice(2);
      if (day === 0 && value.length === 2) value = '01';
    }
    if (value.length >= 4) {
      const month = parseInt(value.slice(2, 4));
      if (month > 12) value = value.slice(0, 2) + '12' + value.slice(4);
      if (month === 0) value = value.slice(0, 2) + '01' + value.slice(4);
    }
    
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setFinishDate(formatted);
  };

  const handleFinishWork = async () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(finishDate)) {
      alert('El formato de fecha debe ser DD/MM/AAAA');
      return;
    }

    const [d, m, y] = finishDate.split('/').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
      alert('La fecha ingresada no es válida');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...ticket,
        estado: 'Terminado',
        fecha_termino: finishDate,
        notas_tecnicas: finishNotes || ticket.notas_tecnicas
      };
      await ticketsService.update(ticket.id, payload);
      onClose(); // Cerrar y recargar agenda
    } catch (err) {
      console.error(err);
      alert('Error al terminar el trabajo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" style={{ zIndex: 1200 }}>
        <div className="modal-content" style={{ maxWidth: '600px', padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem' }}>Cargando detalles del trabajo...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="modal-overlay" style={{ zIndex: 1200 }}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Error</h2>
            <button className="btn-close" onClick={onClose}><X size={24} /></button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--error)" />
            <p style={{ marginTop: '1rem' }}>{error || "Trabajo no encontrado."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content" style={{ maxWidth: '700px', backgroundColor: '#000', border: '1px solid #333' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{ticket.numero_ticket}</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: 0 }}>
              Registrado el {new Date(ticket.fecha_creacion + 'T12:00:00').toLocaleDateString('es-CL')}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Fila superior: Estado y Prioridad */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              backgroundColor: ticket.estado === 'Terminado' ? 'rgba(0, 123, 255, 0.2)' : (ticket.estado === 'En Proceso' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)'),
              color: ticket.estado === 'Terminado' ? '#007bff' : (ticket.estado === 'En Proceso' ? '#28a745' : '#ffc107'),
              border: `1px solid ${ticket.estado === 'Terminado' ? '#007bff' : (ticket.estado === 'En Proceso' ? '#28a745' : '#ffc107')}`
            }}>
              {ticket.estado}
            </div>
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              border: '1px solid var(--primary)',
              color: 'var(--primary)'
            }}>
              Prioridad {ticket.prioridad}
            </div>
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#fff',
              marginLeft: 'auto'
            }}>
              {ticket.jornada} ({ticket.fecha_agendada})
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Información del Cliente */}
            <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <User size={18} /> Datos del Cliente
              </h4>
              <p style={{ margin: '0.5rem 0' }}><strong>Nombre:</strong> {ticket.cliente_nombre}</p>
              <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> {ticket.direccion_trabajo}
              </p>
              <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> {ticket.telefono_contacto}
              </p>
            </div>

            {/* Información del Proyecto / Tipo */}
            <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Clipboard size={18} /> Información del Servicio
              </h4>
              <p style={{ margin: '0.5rem 0' }}><strong>Proyecto:</strong> {ticket.proyecto_nombre || 'S/N'}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Tipo:</strong> {ticket.tipo_trabajo}</p>
              {ticket.numero_cotizacion && (
                <p style={{ margin: '0.5rem 0' }}><strong>Cotización:</strong> {ticket.numero_cotizacion}</p>
              )}
            </div>
          </div>

          {/* Descripción del Problema */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <FileText size={18} /> Descripción del Problema / Trabajo
            </h4>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
              {ticket.descripcion_problema}
            </div>
          </div>

          {/* Ítems Técnicos (si existen) */}
          {ticket.items && ticket.items.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                <Clipboard size={18} /> Detalles e Ítems Técnicos
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Descripción del Material / Servicio</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Cant.</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px' }}>{item.descripcion}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notas Técnicas / Observaciones */}
          {ticket.notas_tecnicas && !isFinishing && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                <AlertCircle size={18} /> Notas Técnicas de Terreno
              </h4>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed #444', fontStyle: 'italic' }}>
                {ticket.notas_tecnicas}
              </div>
            </div>
          )}

          {/* Formulario de Cierre */}
          {isFinishing && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 123, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 123, 255, 0.3)' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', color: '#007bff' }}>Finalizar Trabajo</h4>
              
              <div className="form-group">
                <label className="form-label">Fecha de Término (DD/MM/AAAA) (*)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="31/12/2025"
                  value={finishDate}
                  onChange={handleDateChange}
                  maxLength="10"
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Detalle de lo realizado (*)</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  placeholder="Escriba aquí el reporte técnico de lo realizado para finalizar..."
                  value={finishNotes}
                  onChange={e => setFinishNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-primary" style={{ flex: 1, backgroundColor: '#007bff' }} onClick={handleFinishWork} disabled={isSubmitting}>
                  Confirmar Término (Ticket Cerrado)
                </button>
                <button className="btn-secondary" onClick={() => setIsFinishing(false)} disabled={isSubmitting}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #333' }}>
          {!isFinishing && ticket.estado !== 'Terminado' && (
            <button className="btn-primary" style={{ backgroundColor: '#28a745' }} onClick={() => {
              setIsFinishing(true);
              // Pre-poblar fecha con hoy en formato regional
              const hoy = new Date();
              const d = String(hoy.getDate()).padStart(2, '0');
              const m = String(hoy.getMonth() + 1).padStart(2, '0');
              const y = hoy.getFullYear();
              setFinishDate(`${d}/${m}/${y}`);
              setFinishNotes(ticket.notas_tecnicas || '');
            }}>
              Terminar Trabajo
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
}

