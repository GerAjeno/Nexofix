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
    direccion_trabajo: '',
    telefono_contacto: '',
    tipo_trabajo: '',
    jornada: 'Sin Asignar',
    fecha_agendada: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    descripcion_problema: '',
    notas_tecnicas: ''
  });
  const [cotizacionDetalle, setCotizacionDetalle] = useState(null);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
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
        direccion_trabajo: ticket.direccion_trabajo || '',
        telefono_contacto: ticket.telefono_contacto || '',
        tipo_trabajo: ticket.tipo_trabajo || '',
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        jornada: ticket.jornada || 'Sin Asignar',
        fecha_agendada: ticket.fecha_agendada || '',
        descripcion_problema: ticket.descripcion_problema,
        notas_tecnicas: ticket.notas_tecnicas || ''
      });
    }
  }, [ticket]);

  // Cargar detalles de la cotización cuando cambie la selección
  useEffect(() => {
    const loadCotizacionDetalle = async () => {
      if (!formData.cotizacion_id) {
        setCotizacionDetalle(null);
        return;
      }
      
      setIsLoadingDetalle(true);
      try {
        const data = await cotizacionesService.getById(formData.cotizacion_id);
        setCotizacionDetalle(data);
      } catch (err) {
        console.error('Error cargando detalle de cotización:', err);
      } finally {
        setIsLoadingDetalle(false);
      }
    };

    loadCotizacionDetalle();
  }, [formData.cotizacion_id]);

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 8) value = value.slice(0, 8);
    
    // Validar día (primeros 2 dígitos)
    if (value.length >= 2) {
      const day = parseInt(value.slice(0, 2));
      if (day > 31) value = '31' + value.slice(2);
      if (day === 0 && value.length === 2) value = '01'; // No permitir día 00
    }

    // Validar mes (siguientes 2 dígitos)
    if (value.length >= 4) {
      const month = parseInt(value.slice(2, 4));
      if (month > 12) value = value.slice(0, 2) + '12' + value.slice(4);
      if (month === 0) value = value.slice(0, 2) + '01' + value.slice(4); // No permitir mes 00
    }
    
    // Aplicar máscara DD/MM/AAAA
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    
    setFormData({ ...formData, fecha_agendada: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación básica de formato DD/MM/AAAA si hay jornada
    if (formData.jornada !== 'Sin Asignar') {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.fecha_agendada)) {
        setError('El formato de fecha debe ser DD/MM/AAAA');
        setIsSubmitting(false);
        return;
      }

      // Validación lógica de la fecha (ej: no permitir 31 de abril)
      const [d, m, y] = formData.fecha_agendada.split('/').map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
        setError('La fecha ingresada no es válida (ej: compruebe los días del mes)');
        setIsSubmitting(false);
        return;
      }
    }

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
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
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
                onChange={e => {
                  const clientId = e.target.value;
                  const selectedClient = clientes.find(c => c.id == clientId);
                  setFormData(prev => ({
                    ...prev, 
                    cliente_id: clientId,
                    // Inicializar con datos del cliente
                    direccion_trabajo: selectedClient ? selectedClient.direccion : prev.direccion_trabajo,
                    telefono_contacto: selectedClient ? selectedClient.telefono : prev.telefono_contacto
                  }));
                }}
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
                    // Priorizar dirección y teléfono de la cotización si existe
                    direccion_trabajo: selectedCot ? (selectedCot.direccion_trabajo || prev.direccion_trabajo) : prev.direccion_trabajo,
                    telefono_contacto: selectedCot ? (selectedCot.telefono_contacto || prev.telefono_contacto) : prev.telefono_contacto,
                    tipo_trabajo: selectedCot ? (selectedCot.tipo_trabajo || prev.tipo_trabajo) : prev.tipo_trabajo,
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
              <label className="form-label">Dirección del Trabajo (*)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Dirección donde se realiza el trabajo"
                value={formData.direccion_trabajo}
                onChange={e => setFormData({...formData, direccion_trabajo: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono de Contacto (*)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Teléfono para coordinar"
                value={formData.telefono_contacto}
                onChange={e => setFormData({...formData, telefono_contacto: e.target.value})}
                required
              />
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
              <label className="form-label">Tipo de Trabajo</label>
              <select 
                className="form-control" 
                value={formData.tipo_trabajo}
                onChange={e => setFormData({...formData, tipo_trabajo: e.target.value})}
              >
                <option value="">Selecciona tipo...</option>
                <option value="Corrientes Débiles">Corrientes Débiles</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Informática">Informática</option>
                <option value="Redes">Redes</option>
                <option value="Soldadura">Soldadura</option>
                <option value="Garantía">Garantía</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Jornada</label>
              <select 
                className="form-control" 
                value={formData.jornada}
                onChange={e => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    jornada: val,
                    // Si selecciona jornada, automatizar estado a En Proceso si estaba Pendiente
                    estado: (val !== 'Sin Asignar' && prev.estado === 'Pendiente') ? 'En Proceso' : prev.estado
                  }));
                }}
              >
                <option value="Sin Asignar">Sin Asignar</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
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

          {/* Fecha Agendada Condicional */}
          {formData.jornada !== 'Sin Asignar' && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ color: 'var(--primary)' }}>Fecha Agendada (DD/MM/AAAA) (*)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: 31/12/2025"
                value={formData.fecha_agendada}
                onChange={handleDateChange}
                maxLength="10"
                required
                style={{ borderColor: 'var(--primary)', letterSpacing: '1px' }}
              />
            </div>
          )}

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

          {/* Panel de Referencia Técnica (Cotización) */}
          {cotizacionDetalle && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> Información de la Cotización Relacionada
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', opacity: 0.8 }}>Ítems Cotizados:</h5>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '4px 8px' }}>Descripción</th>
                          <th style={{ padding: '4px 8px', textAlign: 'center' }}>Cant.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cotizacionDetalle.items?.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '4px 8px' }}>{item.descripcion}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'center' }}>{item.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', opacity: 0.8 }}>Condiciones y Notas:</h5>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7, 
                    whiteSpace: 'pre-wrap', 
                    maxHeight: '150px', 
                    overflowY: 'auto',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px'
                  }}>
                    {cotizacionDetalle.condiciones_notas || 'Sin notas adicionales.'}
                  </div>
                </div>
              </div>
            </div>
          )}

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

