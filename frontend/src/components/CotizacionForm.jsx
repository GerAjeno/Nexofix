import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { clientesService } from '../services/clientesService';
import { cotizacionesService } from '../services/cotizacionesService';

export default function CotizacionForm({ onClose, onSave }) {
  const [clientes, setClientes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    cliente_id: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    validez: '15 días corridos',
    proyecto: '',
    descripcion_trabajo: '',
    condiciones_notas: 'La forma de pago es adelantando el 50% al cerrar el trato y el otro 50% al terminar el trabajo. Los equipos y trabajo tienen una garantia legal de 1 año desde su instalacion'
  });

  const [items, setItems] = useState([
    { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }
  ]);

  const [totales, setTotales] = useState({
    subtotal: 0,
    descuento_porcentaje: 0,
    descuento_monto: 0,
    total_final: 0
  });

  useEffect(() => {
    // Cargar clientes para el selector
    clientesService.getAll().then(data => setClientes(data)).catch(err => console.error(err));
  }, []);

  // Calcular totales matemáticos en tiempo real cuando cambian los ítems o el descuento
  useEffect(() => {
    let sub = 0;
    const nuevosItems = items.map(item => {
      const cant = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      const tot = cant * precio;
      sub += tot;
      return { ...item, total: tot };
    });

    // Solo actualizamos el estado si detectamos un cambio en los totales de los ítems
    // Para evitar loops infinitos, esto se maneja con cuidado, pero calcular y sobreescribir totales es seguro así:
    const descPorcentaje = Number(totales.descuento_porcentaje) || 0;
    const descMonto = Math.round(sub * (descPorcentaje / 100));
    const final = sub - descMonto;

    setTotales(prev => ({
      ...prev,
      subtotal: sub,
      descuento_monto: descMonto,
      total_final: final
    }));
  }, [items, totales.descuento_porcentaje]); // Recalcular solo en base a estas dependencias

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    // El useEffect se encargará de recalcular el `total` interno y los globales.
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.cliente_id) {
      setError('Por favor selecciona un cliente');
      return;
    }

    // Filtrar items vacíos
    const itemsValidos = items.filter(it => it.descripcion.trim() !== '');
    if (itemsValidos.length === 0) {
      setError('Añade al menos un ítem válido a la cotización');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        ...totales,
        cliente_id: Number(formData.cliente_id),
        items: itemsValidos
      };
      
      await cotizacionesService.create(payload);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error guardando la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h3>Nueva Cotización</h3>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}
          
          <form id="cotizacion-form" onSubmit={handleSave}>
            {/* Cabecera */}
            <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Cliente (*)</label>
                <select 
                  className="form-control" 
                  value={formData.cliente_id}
                  onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.rut})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Emisión</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.fecha_emision}
                  onChange={e => setFormData({...formData, fecha_emision: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Validez</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.validez}
                  placeholder="Ej: 15 días corridos"
                  onChange={e => setFormData({...formData, validez: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Proyecto (Opcional)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: Motor portón casa"
                value={formData.proyecto}
                onChange={e => setFormData({...formData, proyecto: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del Trabajo</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="Resumen del trabajo a realizar..."
                value={formData.descripcion_trabajo}
                onChange={e => setFormData({...formData, descripcion_trabajo: e.target.value})}
              ></textarea>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

            {/* Ítems */}
            <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Ítems de Cobro</h4>
            <div className="table-container" style={{ marginBottom: '1rem' }}>
              <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{ width: '100px' }}>Cant.</th>
                    <th style={{ width: '150px' }}>Precio Unit. ($)</th>
                    <th style={{ width: '150px' }}>Total</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Descripción del material o servicio..."
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={item.cantidad}
                          min="1"
                          onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={item.precio_unitario}
                          min="0"
                          onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', verticalAlign: 'middle', fontWeight: 'bold' }}>
                        ${(item.cantidad * item.precio_unitario).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '0.5rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button 
                          type="button"
                          className="btn-close"
                          onClick={() => removeItem(index)}
                          title="Eliminar ítem"
                        >
                          <Trash2 size={16} color="var(--warning)" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <button type="button" className="btn-secondary" onClick={addItem}>
                <Plus size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} /> Añadir Ítem
              </button>

              <div style={{ width: '300px', background: 'var(--sidebar-hover)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <strong>${totales.subtotal.toLocaleString('es-CL')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span>Descuento (%):</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ width: '70px', padding: '0.25rem' }} 
                    min="0" max="100"
                    value={totales.descuento_porcentaje}
                    onChange={(e) => setTotales({...totales, descuento_porcentaje: e.target.value})}
                  />
                </div>
                {totales.descuento_monto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--warning)' }}>
                    <span>Monto Descontado:</span>
                    <span>- ${totales.descuento_monto.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem' }}>
                  <strong>Total Final:</strong>
                  <strong style={{ color: 'var(--primary)' }}>${totales.total_final.toLocaleString('es-CL')}</strong>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label">Condiciones y Notas</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={formData.condiciones_notas}
                onChange={e => setFormData({...formData, condiciones_notas: e.target.value})}
              ></textarea>
            </div>

          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
          <button type="submit" form="cotizacion-form" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cotización'}
          </button>
        </div>
      </div>
    </div>
  );
}
