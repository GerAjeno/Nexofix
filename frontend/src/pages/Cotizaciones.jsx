import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import { cotizacionesService } from '../services/cotizacionesService';
import CotizacionForm from '../components/CotizacionForm';
import CotizacionPDF from '../components/CotizacionPDF';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
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
              <th>Cliente</th>
              <th>Total</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map(cot => (
              <tr key={cot.id}>
                <td><strong>{cot.numero_cotizacion}</strong></td>
                <td>{new Date(cot.fecha_emision + 'T00:00:00').toLocaleDateString('es-CL')}</td>
                <td>{cot.cliente_nombre || 'Cliente Desconocido'}</td>
                <td>${cot.total_final?.toLocaleString('es-CL')}</td>
                <td style={{textAlign: 'right'}}>
                  <button 
                    onClick={() => handeOpenPdf(cot.id)} 
                    className="btn-secondary" 
                    style={{ marginRight: '8px' }} 
                    title="Ver / Generar PDF"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cot.id, cot.numero_cotizacion)} 
                    className="btn-secondary" 
                    style={{ color: 'var(--warning)', borderColor: 'transparent' }} 
                    title="Archivar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {cotizaciones.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay cotizaciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CotizacionForm 
          onClose={() => setShowModal(false)} 
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
