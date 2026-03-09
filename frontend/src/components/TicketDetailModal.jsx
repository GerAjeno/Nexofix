import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Phone, Clipboard, FileText, AlertCircle, User } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';

export default function TicketDetailModal({ ticketId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
              backgroundColor: ticket.estado === 'En Proceso' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)',
              color: ticket.estado === 'En Proceso' ? '#28a745' : '#ffc107',
              border: `1px solid ${ticket.estado === 'En Proceso' ? '#28a745' : '#ffc107'}`
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
          {ticket.notas_tecnicas && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                <AlertCircle size={18} /> Notas Técnicas de Terreno
              </h4>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px dashed #444', fontStyle: 'italic' }}>
                {ticket.notas_tecnicas}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #333' }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
}
