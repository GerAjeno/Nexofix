import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Edit2, CheckCircle } from 'lucide-react';
import { cotizacionesService } from '../services/cotizacionesService';
import CotizacionForm from '../components/CotizacionForm';
import CotizacionPDF from '../components/CotizacionPDF';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const loadCotizaciones = async () => {
    try {
      const data = await cotizacionesService.getAll();
      setCotizaciones(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCotizaciones();
  }, []);

  const handleDelete = async (id, numero) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar (archivar) la cotización ${numero}?`)) {
      try {
        await cotizacionesService.delete(id);
        loadCotizaciones();
      } catch(err) {
        alert('Error al archivar la cotización');
      }
    }
  };

  const handleAccept = async (id, numero) => {
    if (window.confirm(`¿Aceptar la cotización ${numero}? Se creará automáticamente un Ticket de trabajo.`)) {
      try {
        await cotizacionesService.aceptar(id);
        alert(`Cotización ${numero} aceptada. Se ha generado un nuevo ticket.`);
        loadCotizaciones();
      } catch (err) {
        console.error(err);
        alert('Error al aceptar la cotización');
      }
    }
  };

  const handeOpenPdf = async (cotizacionId) => {
    try {
      // Obtener el registro detallado con todos sus ítems
      const data = await cotizacionesService.getById(cotizacionId);
      setPdfData(data);
    } catch (err) {
      console.error(err);
      alert('Error cargando los detalles para el PDF');
    }
  };

  return (
    <div>
      <div className="flex-between">
        <div>
          <h2 className="page-title">Cotizaciones</h2>
          <p className="page-subtitle">Gestiona y genera presupuestos para tus clientes</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedCotizacion(null); setShowModal(true); }}>
          <Plus size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Nueva Cotización
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Cotización</th>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Cliente</th>
              <th>Total</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map(cot => (
              <tr key={cot.id}>
                <td>{cot.numero_cotizacion}</td>
                <td>{new Date(cot.fecha_emision + 'T12:00:00').toLocaleDateString('es-CL')}</td>
                <td style={{ fontWeight: '500', color: 'var(--primary)' }}>{cot.proyecto || '-'}</td>
                <td>{cot.cliente_nombre || 'Cliente Desconocido'}</td>
                <td>${cot.total_final?.toLocaleString('es-CL')}</td>
                <td style={{textAlign: 'right'}}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gap: '4px', justifyContent: 'end' }}>
                    <button 
                      onClick={() => handleAccept(cot.id, cot.numero_cotizacion)} 
                      className="icon-btn" 
                      style={{ color: 'var(--success)' }}
                      title="Aceptar Cotización (Crear Ticket)"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handeOpenPdf(cot.id)} 
                      className="icon-btn" 
                      title="Ver / Generar PDF"
                    >
                      <Printer size={18} />
                    </button>
                    <button 
                      onClick={() => { setSelectedCotizacion(cot); setShowModal(true); }} 
                      className="icon-btn" 
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cot.id, cot.numero_cotizacion)} 
                      className="icon-btn delete" 
                      title="Archivar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cotizaciones.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay cotizaciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CotizacionForm 
          cotizacion={selectedCotizacion}
          onClose={() => { setShowModal(false); setSelectedCotizacion(null); }} 
          onSave={loadCotizaciones}
        />
      )}

      {pdfData && (
        <CotizacionPDF 
          data={pdfData} 
          onClose={() => setPdfData(null)} 
        />
      )}
    </div>
  );
}
