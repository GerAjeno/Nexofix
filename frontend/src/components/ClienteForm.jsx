import { useState } from 'react';
import { X } from 'lucide-react';
import { validarRut, formatRut } from '../utils/rutValidation';

export default function ClienteForm({ onClose, onSave, cliente = null }) {
  const [formData, setFormData] = useState(
    cliente || {
      tipo: 'Cliente Final',
      rut: '',
      nombre: '',
      representante: '',
      telefono: '',
      email: '',
      direccion: '',
      giro: '',
      notas_texto: '',
    }
  );
  
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'rut') {
      value = formatRut(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate specific fields
    if (!formData.nombre || !formData.rut || !formData.tipo) {
      setError('Nombre, RUT y Tipo son obligatorios.');
      return;
    }

    if (!validarRut(formData.rut)) {
      setError('El RUT ingresado no es válido.');
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ocurrió un error al guardar');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tipo de Cliente *</label>
                <select 
                  className="form-control" 
                  name="tipo" 
                  value={formData.tipo} 
                  onChange={handleChange}
                  required
                >
                  <option value="Cliente Final">Cliente Final</option>
                  <option value="Condominio">Condominio</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">RUT *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="rut" 
                  placeholder="ej. 12345678-9"
                  value={formData.rut} 
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Nombre / Razón Social *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleChange}
                  required 
                />
              </div>

              {(formData.tipo === 'Empresa' || formData.tipo === 'Condominio') && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Representante Legal / Administrador</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="representante" 
                    value={formData.representante} 
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Dirección</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="direccion" 
                  value={formData.direccion} 
                  onChange={handleChange}
                />
              </div>

              {formData.tipo === 'Empresa' && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Giro</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="giro" 
                    value={formData.giro} 
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Notas Especiales</label>
                <textarea 
                  className="form-control" 
                  name="notas_texto" 
                  rows="3"
                  value={formData.notas_texto} 
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {cliente ? 'Actualizar' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
