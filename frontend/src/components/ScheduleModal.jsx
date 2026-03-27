import { useState, useEffect } from 'react';
import { X, Calendar, Save, AlertCircle } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';

export default function ScheduleModal({ ticket, onClose, onSave }) {
  const [formData, setFormData] = useState({
    jornada: ticket.jornada || 'Sin Asignar',
    fecha_agendada: ticket.fecha_agendada || '',
    estado: ticket.estado
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 8) value = value.slice(0, 8);
    
    // Validar día (primeros 2 dígitos)
    if (value.length >= 2) {
      const day = parseInt(value.slice(0, 2));
      if (day > 31) value = '31' + value.slice(2);
      if (day === 0 && value.length === 2) value = '01';
    }

    // Validar mes (siguientes 2 dígitos)
    if (value.length >= 4) {
      const month = parseInt(value.slice(2, 4));
      if (month > 12) value = value.slice(0, 2) + '12' + value.slice(4);
      if (month === 0) value = value.slice(0, 2) + '01' + value.slice(4);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación lógica de la fecha
    if (formData.jornada !== 'Sin Asignar') {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.fecha_agendada)) {
        setError('El formato de fecha debe ser DD/MM/AAAA');
        setIsSubmitting(false);
        return;
      }
      const [d, m, y] = formData.fecha_agendada.split('/').map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
        setError('La fecha ingresada no es válida');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Si se agenda, el estado pasa automáticamente a "En Proceso" si estaba en Pendiente
      let finalEstado = formData.estado;
      if (formData.jornada !== 'Sin Asignar' && finalEstado === 'Pendiente') {
        finalEstado = 'En Proceso';
      }

      const payload = {
        ...ticket, // Mantener resto de campos
        jornada: formData.jornada,
        fecha_agendada: formData.fecha_agendada,
        estado: finalEstado
      };

      await ticketsService.update(ticket.id, payload);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agendar el trabajo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '400px', backgroundColor: '#000', border: '1px solid #333' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} className="text-primary" />
            Agendar {ticket.numero_ticket || `TKT-${ticket.id}`}
          </h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        {error && (
          <div className="error-alert" style={{ margin: '1rem', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Jornada</label>
            <select 
              className="form-control" 
              value={formData.jornada}
              onChange={e => setFormData({...formData, jornada: e.target.value})}
              required
            >
              <option value="Sin Asignar">Sin Asignar</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
          </div>

          {formData.jornada !== 'Sin Asignar' && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Fecha Agendada (DD/MM/AAAA) (*)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ej: 31/12/2025"
                value={formData.fecha_agendada}
                onChange={handleDateChange}
                maxLength="10"
                required
                style={{ borderColor: 'var(--primary)', letterSpacing: '1px' }}
                autoFocus
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cerrar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Save size={20} style={{ marginRight: '8px' }} />
              {isSubmitting ? 'Guardando...' : 'Agendar Trabajo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
