import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, FileSpreadsheet } from 'lucide-react';
import { clientesService } from '../services/api';
import { cotizacionesService } from '../services/cotizacionesService';
import { plantillasService } from '../services/plantillasService';

export default function CotizacionForm({ onClose, onSave }) {
  const [clientes, setClientes] = useState([]);
  const [plantillasDesc, setPlantillasDesc] = useState([]);
  const [plantillasCond, setPlantillasCond] = useState([]);
  const [plantillasItems, setPlantillasItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Generar número no consecutivo de 6 dígitos
  const generarNumeroCotizacion = () => {
    return `COT-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const [formData, setFormData] = useState({
    numero_cotizacion: '',
    cliente_id: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_emision_formateada: new Date().toLocaleDateString('es-CL'),
    validez: '15 días corridos',
    tipo_trabajo: 'Corrientes Débiles',
    proyecto: '',
    descripcion_trabajo: '',
    condiciones_notas: 'La forma de pago es adelantando el 50% al cerrar el trato y el otro 50% al terminar el trabajo. Los equipos y trabajo tienen una garantia legal de 1 año desde su instalacion',
    tipo_impuesto: 'Sin Impuesto'
  });

  const [items, setItems] = useState([
    { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }
  ]);

  const [totales, setTotales] = useState({
    subtotal: 0,
    descuento_monto: 0,
    monto_impuesto: 0,
    total_final: 0
  });

  useEffect(() => {
    // Cargar datos iniciales
    clientesService.getAll().then(data => setClientes(data)).catch(err => console.error(err));
    plantillasService.getTextos('descripcion').then(data => setPlantillasDesc(data)).catch(err => console.error(err));
    plantillasService.getTextos('condiciones').then(data => setPlantillasCond(data)).catch(err => console.error(err));
    plantillasService.getItemizadosPresets().then(data => setPlantillasItems(data)).catch(err => console.error(err));
    
    // Asignar número base una vez abierto el modal
    const hoy = new Date().toISOString().split('T')[0];
    const [y, m, d] = hoy.split('-');
    const hoyFormateado = `${d}/${m}/${y}`;
    
    setFormData(prev => ({
      ...prev, 
      numero_cotizacion: generarNumeroCotizacion(), // Keep original logic for generation
      fecha_emision: hoy,
      fecha_emision_formateada: hoyFormateado
    }));
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
    // Cálculos de Totales
    const descMonto = Number(totales.descuento_monto) || 0;
    
    let subtotalCalculado = sub;
    let impuesto = 0;
    let final = sub - descMonto;

    if (formData.tipo_impuesto === 'Factura (IVA 19%)') {
      const montoNeto = sub - descMonto;
      impuesto = Math.round(montoNeto * 0.19);
      final = montoNeto + impuesto;
    } else if (formData.tipo_impuesto.includes('Boleta')) {
      // Nueva Lógica: El Subtotal es la suma de los "Total Boleta" de cada ítem
      // Calculamos el subtotal bruto sumando (neto * 1.1525) de cada ítem
      const subtotalBruto = items.reduce((acc, item) => acc + Math.round((item.cantidad * item.precio_unitario) * 1.1525), 0);
      subtotalCalculado = subtotalBruto;
      
      const subtotalConDescuento = subtotalBruto - descMonto;
      // La retención es el 15.25% del subtotal bruto con descuento
      impuesto = Math.round(subtotalConDescuento * 0.1525);
      // El total final es la resta
      final = subtotalConDescuento - impuesto;
    }

    setTotales(prev => ({
      ...prev,
      subtotal: subtotalCalculado,
      descuento_monto: descMonto,
      monto_impuesto: impuesto,
      total_final: final
    }));
  }, [items, totales.descuento_monto, formData.tipo_impuesto]); // Recalcular solo en base a estas dependencias

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'precio_unitario') {
      const rawValue = value.replace(/\D/g, '');
      newItems[index][field] = rawValue === '' ? 0 : parseInt(rawValue);
    } else {
      newItems[index][field] = value;
    }

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

  const handleDateChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, ''); // Solo números
    if (rawValue.length > 8) rawValue = rawValue.slice(0, 8);

    // Validar por partes durante la escritura
    if (rawValue.length >= 2) {
      const dia = parseInt(rawValue.slice(0, 2));
      if (dia < 1 || dia > 31) return; // No permitir días inválidos
    }
    if (rawValue.length >= 4) {
      const mes = parseInt(rawValue.slice(2, 4));
      if (mes < 1 || mes > 12) return; // No permitir meses inválidos
    }

    // Auto-formatear DD/MM/AAAA
    let formatted = rawValue;
    if (rawValue.length > 2) {
      formatted = rawValue.slice(0, 2) + '/' + rawValue.slice(2);
    }
    if (rawValue.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + rawValue.slice(4);
    }

    // Actualizar el valor visual
    setFormData(prev => ({...prev, fecha_emision_formateada: formatted}));

    // Si está completo (8 dígitos), actualizar el estado real y validado
    if (rawValue.length === 8) {
      const d = rawValue.slice(0, 2);
      const m = rawValue.slice(2, 4);
      const y = rawValue.slice(4, 8);
      
      // Verificación final de fecha real (ej: no permitir 31/02)
      const dateCheck = new Date(`${y}-${m}-${d}T12:00:00`);
      if (!isNaN(dateCheck.getTime()) && dateCheck.getDate() === parseInt(d)) {
        setFormData(prev => ({
          ...prev, 
          fecha_emision: `${y}-${m}-${d}`,
          fecha_emision_formateada: formatted
        }));
      } else {
        alert('Fecha inválida');
      }
    }
  };
  
  const handleDiscountChange = (e) => {
    // Eliminar todo lo que no sea número
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue === '' ? 0 : parseInt(rawValue);
    
    setTotales(prev => ({
      ...prev,
      descuento_monto: numericValue
    }));
  };

  const formatDisplayDiscount = (value) => {
    if (!value || value === 0) return '';
    return `- $${value.toLocaleString('es-CL')}`;
  };

  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    return `$${value.toLocaleString('es-CL')}`;
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

  const handleSaveTextTemplate = async (tipo) => {
    const contenido = tipo === 'descripcion' ? formData.descripcion_trabajo : formData.condiciones_notas;
    if (!contenido.trim()) {
      alert('El contenido no puede estar vacío');
      return;
    }

    const nombre = prompt(`Ingrese un nombre para esta plantilla de ${tipo}:`);
    if (!nombre) return;

    try {
      await plantillasService.createTexto({ tipo, nombre, contenido });
      alert('Plantilla guardada con éxito');
      // Recargar plantillas
      if (tipo === 'descripcion') {
        const data = await plantillasService.getTextos('descripcion');
        setPlantillasDesc(data);
      } else {
        const data = await plantillasService.getTextos('condiciones');
        setPlantillasCond(data);
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar la plantilla');
    }
  };

  const handleSaveItemizedPreset = async () => {
    const itemsValidos = items.filter(it => it.descripcion.trim() !== '');
    if (itemsValidos.length === 0) {
      alert('Añade al menos un ítem válido para guardar la plantilla');
      return;
    }

    const nombre = prompt('Ingrese un nombre para esta plantilla de itemizado completo:');
    if (!nombre) return;

    try {
      await plantillasService.createItemizadoPreset(nombre, itemsValidos);
      alert('Plantilla de itemizado guardada con éxito');
      const data = await plantillasService.getItemizadosPresets();
      setPlantillasItems(data);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la plantilla de itemizado');
    }
  };

  const loadItemizedPreset = async (presetId) => {
    if (!presetId) return;
    try {
      const details = await plantillasService.getItemizadoDetails(presetId);
      const newItems = details.map(d => ({
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        total: d.cantidad * d.precio_unitario
      }));
      setItems(newItems);
    } catch (err) {
      console.error(err);
      alert('Error al cargar la plantilla de itemizado');
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
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ width: '140px', flexShrink: 0 }}>
                <label className="form-label">N° Cotización</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.numero_cotizacion}
                  readOnly
                  style={{ backgroundColor: 'var(--bg-color)', color: 'var(--primary)', fontWeight: 'bold' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
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
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ width: '220px', flexShrink: 0 }}>
                <label className="form-label">Fecha de Emisión (DD/MM/AAAA)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="DD/MM/AAAA"
                    value={formData.fecha_emision_formateada || ''}
                    onChange={handleDateChange}
                    maxLength="10"
                    required
                    style={{ 
                      fontSize: '1rem', 
                      letterSpacing: '0.5px', 
                      fontWeight: '500', 
                      textAlign: 'center',
                      color: 'var(--primary)',
                      borderColor: (formData.fecha_emision_formateada?.length === 10) ? 'var(--primary)' : 'var(--border-color)'
                    }}
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Mascará: DD/MM/AAAA</small>
              </div>
              <div className="form-group" style={{ width: '180px', flexShrink: 0 }}>
                <label className="form-label">Validez</label>
                <select 
                  className="form-control" 
                  value={formData.validez}
                  onChange={e => setFormData({...formData, validez: e.target.value})}
                >
                  <option value="5 días corridos">5 días corridos</option>
                  <option value="10 días corridos">10 días corridos</option>
                  <option value="15 días corridos">15 días corridos</option>
                  <option value="30 días corridos">30 días corridos</option>
                </select>
              </div>
              <div className="form-group" style={{ width: '200px', flexShrink: 0 }}>
                <label className="form-label">Tipo de Trabajo</label>
                <select 
                  className="form-control" 
                  value={formData.tipo_trabajo}
                  onChange={e => setFormData({...formData, tipo_trabajo: e.target.value})}
                >
                  <option value="Corrientes Débiles">Corrientes Débiles</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Informática">Informática</option>
                  <option value="Redes">Redes</option>
                  <option value="Soldadura">Soldadura</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
                <label className="form-label">Proyecto (*)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Mantenimiento anual cámaras"
                  value={formData.proyecto}
                  onChange={e => setFormData({...formData, proyecto: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Tipo de Impuesto</label>
                <select 
                  className="form-control" 
                  value={formData.tipo_impuesto}
                  onChange={e => setFormData({...formData, tipo_impuesto: e.target.value})}
                >
                  <option value="Sin Impuesto">Sin Impuesto</option>
                  <option value="Factura (IVA 19%)">Factura (IVA 19%)</option>
                  <option value="Boleta (Honorarios 15.25%)">Boleta (Honorarios 15.25%)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Descripción del Trabajo</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {plantillasDesc.length > 0 && (
                    <select 
                      className="form-control" 
                      style={{ width: '160px', padding: '2px 8px', fontSize: '11px' }}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({...formData, descripcion_trabajo: e.target.value});
                        }
                      }}
                    >
                      <option value="">Cargar plantilla...</option>
                      {plantillasDesc.map(p => (
                        <option key={p.id} value={p.contenido}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                  <button 
                    type="button" 
                    className="icon-btn" 
                    title="Guardar como plantilla"
                    onClick={() => handleSaveTextTemplate('descripcion')}
                    style={{ color: 'var(--primary)' }}
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--primary)' }}>Itemizado</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {plantillasItems.length > 0 && (
                  <select 
                    className="form-control" 
                    style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
                    onChange={(e) => loadItemizedPreset(e.target.value)}
                  >
                    <option value="">Cargar grupo de ítems...</option>
                    {plantillasItems.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                )}
                <button 
                  type="button" 
                  className="icon-btn" 
                  title="Guardar itemizado completo como plantilla"
                  onClick={handleSaveItemizedPreset}
                  style={{ color: 'var(--primary)' }}
                >
                  <FileSpreadsheet size={20} />
                </button>
              </div>
            </div>
            <div className="table-container" style={{ marginBottom: '1rem' }}>
              <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{ width: '100px' }}>Cant.</th>
                    <th style={{ width: '150px' }}>Precio Unit. ($)</th>
                    <th style={{ width: '150px' }}>Total</th>
                    {formData.tipo_impuesto.includes('Boleta') && (
                      <th style={{ width: '150px' }}>Total Boleta</th>
                    )}
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Descripción..."
                            value={item.descripcion}
                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                          />
                        </div>
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
                          type="text" 
                          className="form-control" 
                          style={{ textAlign: 'right' }}
                          value={formatPrice(item.precio_unitario)}
                          onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', verticalAlign: 'middle', fontWeight: formData.tipo_impuesto.includes('Boleta') ? 'normal' : 'bold' }}>
                        ${(item.cantidad * item.precio_unitario).toLocaleString('es-CL')}
                      </td>
                      {formData.tipo_impuesto.includes('Boleta') && (
                        <td style={{ padding: '0.5rem', verticalAlign: 'middle', fontWeight: 'bold', color: 'var(--primary)' }}>
                          ${Math.round((item.cantidad * item.precio_unitario) * 1.1525).toLocaleString('es-CL')}
                        </td>
                      )}
                      <td style={{ padding: '0.5rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button 
                          type="button"
                          className="btn-close"
                          onClick={() => removeItem(index)}
                          title="Eliminar ítem"
                          style={{ padding: '4px' }}
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
                  <span>Descuento ($):</span>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ 
                      width: '120px', 
                      padding: '0.25rem', 
                      textAlign: 'right',
                      color: totales.descuento_monto > 0 ? 'var(--warning)' : 'inherit',
                      fontWeight: totales.descuento_monto > 0 ? 'bold' : 'normal'
                    }} 
                    placeholder="$ 0"
                    value={formatDisplayDiscount(totales.descuento_monto)}
                    onChange={handleDiscountChange}
                  />
                </div>
                {totales.monto_impuesto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    <span>
                      {formData.tipo_impuesto.includes('Factura') ? 'IVA (19%)' : 
                       formData.tipo_impuesto.includes('Boleta') ? 'Retención (15.25%)' : 
                       'Impuesto'}:
                    </span>
                    <span>+ ${totales.monto_impuesto.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem' }}>
                  <strong>Total Final:</strong>
                  <strong style={{ color: 'var(--primary)' }}>${totales.total_final.toLocaleString('es-CL')}</strong>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Condiciones y Notas</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {plantillasCond.length > 0 && (
                    <select 
                      className="form-control" 
                      style={{ width: '160px', padding: '2px 8px', fontSize: '11px' }}
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData({...formData, condiciones_notas: e.target.value});
                        }
                      }}
                    >
                      <option value="">Cargar plantilla...</option>
                      {plantillasCond.map(p => (
                        <option key={p.id} value={p.contenido}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                  <button 
                    type="button" 
                    className="icon-btn" 
                    title="Guardar como plantilla"
                    onClick={() => handleSaveTextTemplate('condiciones')}
                    style={{ color: 'var(--primary)' }}
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
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
