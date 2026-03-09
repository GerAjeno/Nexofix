import { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, FileText, CheckCircle } from 'lucide-react';
import { cobranzasService } from '../services/cobranzasService';

export default function PaymentModal({ cobranza, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fecha_pago: '',
    metodo_pago: 'Transferencia',
    notas_pago: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Pre-poblar con fecha de hoy
    const hoy = new Date();
    const d = String(hoy.getDate()).padStart(2, '0');
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const y = hoy.getFullYear();
    setFormData(prev => ({ ...prev, fecha_pago: `${d}/${m}/${y}` }));
  }, []);

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
    setFormData(prev => ({ ...prev, fecha_pago: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.fecha_pago)) {
      alert('El formato de fecha debe ser DD/MM/AAAA');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        estado: 'Cobrado',
        fecha_pago: formData.fecha_pago,
        metodo_pago: formData.metodo_pago,
        notas_pago: formData.notas_pago
      };
      await cobranzasService.update(cobranza.id, payload);
      onSave();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Registrar Pago: {cobranza.numero_cobro}</h2>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>ID Ticket: {cobranza.numero_ticket}</p>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Fecha del Pago (DD/MM/AAAA) (*)</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '40px' }}
                placeholder="31/12/2025"
                value={formData.fecha_pago}
                onChange={handleDateChange}
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Medio de Pago (*)</label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <select 
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={formData.metodo_pago}
                onChange={e => setFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                required
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Cheque">Cheque</option>
                <option value="Tarjeta de Credito">Tarjeta de Crédito</option>
                <option value="Tarjeta de Debito">Tarjeta de Débito</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Notas / Referencias de Pago</label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
              <textarea 
                className="form-control"
                style={{ paddingLeft: '40px', minHeight: '100px' }}
                placeholder="N° de transferencia, RUT de cuenta origen, N° de cheque o código de transacción..."
                value={formData.notas_pago}
                onChange={e => setFormData(prev => ({ ...prev, notas_pago: e.target.value }))}
              ></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#28a745' }} disabled={isSubmitting}>
              <CheckCircle size={18} style={{ marginRight: '8px' }} />
              Confirmar Recepción de Pago
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
