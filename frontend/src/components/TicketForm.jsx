import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';
import { clientesService } from '../services/api';
import { cotizacionesService } from '../services/cotizacionesService';

export default function TicketForm({ ticket, onClose, onSave }) {
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: '',
    cotizacion_id: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    descripcion_problema: '',
    notas_tecnicas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar listas de selección
    const loadData = async () => {
      try {
        const [c, cot] = await Promise.all([
          clientesService.getAll(),
          cotizacionesService.getAll()
        ]);
        setClientes(c);
        setCotizaciones(cot);
      } catch (err) {
        console.error('Error cargando listas:', err);
      }
    };
    loadData();

    if (ticket) {
      setFormData({
        cliente_id: ticket.cliente_id,
        cotizacion_id: ticket.cotizacion_id || '',
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        descripcion_problema: ticket.descripcion_problema,
        notas_tecnicas: ticket.notas_tecnicas || ''
      });
    }
  }, [ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (ticket) {
        await ticketsService.update(ticket.id, formData);
      } else {
        await ticketsService.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al guardar el trabajo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '750px', backgroundColor: '#000', border: '1px solid #333' }}>
        <div className="modal-header">
          <h2 className="modal-title">{ticket ? `Editar Trabajo ${ticket.numero_ticket}` : 'Nuevo Trabajo / Ticket'}</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {error && (
          <div className="error-alert" style={{ margin: '1rem', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="dashboard-grid">
            <div className="form-group">
              <label className="form-label">Cliente (*)</label>
              <select 
                className="form-control" 
                value={formData.cliente_id}
                onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                required
                disabled={!!ticket}
              >
                <option value="">Selecciona un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.rut})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cotización Relacionada (Opcional)</label>
              <select 
                className="form-control" 
                value={formData.cotizacion_id}
                onChange={e => {
                  const cotId = e.target.value;
                  const selectedCot = cotizaciones.find(c => c.id == cotId);
                  
                  setFormData(prev => ({
                    ...prev, 
                    cotizacion_id: cotId,
                    // Auto-completar descripción si está vacía
                    descripcion_problema: (prev.descripcion_problema === '' && selectedCot) 
                      ? selectedCot.descripcion_trabajo 
                      : prev.descripcion_problema
                  }));
                }}
                disabled={!!ticket}
              >
                <option value="">Ninguna...</option>
                {cotizaciones.filter(c => !formData.cliente_id || c.cliente_id == formData.cliente_id).map(c => (
                  <option key={c.id} value={c.id}>{c.numero_cotizacion} - {c.proyecto}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select 
                className="form-control" 
                value={formData.estado}
                onChange={e => setFormData({...formData, estado: e.target.value})}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Terminado">Terminado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select 
                className="form-control" 
                value={formData.prioridad}
                onChange={e => setFormData({...formData, prioridad: e.target.value})}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Descripción del Problema / Trabajo (*)</label>
            <textarea 
              className="form-control" 
              rows="4"
              placeholder="Detalle el requerimiento del cliente..."
              value={formData.descripcion_problema}
              onChange={e => setFormData({...formData, descripcion_problema: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Notas Técnicas (uso interno)</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="Observaciones técnicas, materiales usados, etc."
              value={formData.notas_tecnicas}
              onChange={e => setFormData({...formData, notas_tecnicas: e.target.value})}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Save size={20} style={{ marginRight: '8px' }} />
              {isSubmitting ? 'Guardando...' : 'Guardar Trabajo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
