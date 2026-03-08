import React, { useRef } from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function CotizacionPDF({ data, onClose }) {
  const printRef = useRef();

  if (!data) return null;

  const handleDownload = () => {
    const element = printRef.current;
    
    // Opciones para asegurar que se vea idéntico al componente y con buena calidad
    const opt = {
      margin:       0,
      filename:     `${data.numero_cotizacion}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatearDinero = (monto) => {
    return '$' + (monto || 0).toLocaleString('es-CL');
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100, overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '850px', backgroundColor: '#e2e8f0', padding: '1rem', borderRadius: '8px' }}>
        
        {/* Controles del Modal PDF */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Vista Previa de Impresión</h3>
          <div>
            <button className="btn-secondary" onClick={onClose} style={{ marginRight: '1rem' }}>
              Cerrar
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-top' }} /> 
              Descargar PDF
            </button>
          </div>
        </div>

        {/* El Documento Real A1 / Carta */}
        <div style={{ margin: '0 auto', background: '#ffffff', width: '8.5in', minHeight: '11in', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div ref={printRef} style={{ width: '100%', minHeight: '11in', background: '#fff', color: '#333', fontFamily: '"Arial", sans-serif', fontSize: '14px', lineHeight: 1.5 }}>
            
            {/* Header / Franja Azul Superior */}
            <div style={{ background: '#14b8a6', background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)', padding: '2rem 3rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Logo Escudo Placeholder */}
                <div style={{ width: '60px', height: '60px', background: '#1e3a8a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', border: '2px solid #38bdf8' }}>
                  <ShieldCheck size={36} color="#fde047" />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', letterSpacing: '0.05em' }}>NexoFix SpA</h1>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Servicios Integrales</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'normal' }}>COTIZACIÓN</h2>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>N° {data.numero_cotizacion}</div>
              </div>
            </div>

            {/* Contenido (Padding interno general) */}
            <div style={{ padding: '2rem 3rem' }}>
              
              {/* Información General */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>Cotizado a:</h3>
                  <div style={{ marginBottom: '4px' }}>Cliente: {data.cliente_nombre}</div>
                  <div style={{ marginBottom: '4px' }}>RUT: {data.cliente_rut}</div>
                  <div style={{ marginBottom: '4px' }}>Dirección: {data.cliente_direccion || 'No registrada'}</div>
                  {data.proyecto && <div style={{ marginBottom: '4px' }}>Proyecto: {data.proyecto}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '15px', color: '#4b5563' }}>Fecha Emisión:</span>
                    <span>{formatearFecha(data.fecha_emision)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '15px', color: '#4b5563' }}>Validez:</span>
                    <span>{data.validez}</span>
                  </div>
                  {data.tipo_trabajo && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '15px', color: '#4b5563' }}>Tipo de Trabajo:</span>
                      <span>{data.tipo_trabajo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción del Trabajo */}
              {data.descripcion_trabajo && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>Descripción del Trabajo:</h4>
                  <p style={{ margin: 0, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{data.descripcion_trabajo}</p>
                </div>
              )}

              {/* Tabla de ítems */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderTopLeftRadius: '4px' }}>Descripción</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center' }}>Cantidad</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right' }}>Precio Unitario</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right', borderTopRightRadius: '4px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items && data.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ padding: '12px 15px', color: '#4b5563' }}>{item.descripcion}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', color: '#4b5563' }}>{item.cantidad}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'right', color: '#4b5563' }}>{formatearDinero(item.precio_unitario)}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'right', color: '#1f2937', fontWeight: '500' }}>{formatearDinero(item.total)}</td>
                    </tr>
                  ))}
                  {(!data.items || data.items.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Sin detalles</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totales */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563' }}>
                    <span>Subtotal Servicios:</span>
                    <span>{formatearDinero(data.subtotal)}</span>
                  </div>
                  {data.descuento_monto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#059669' }}>
                      <span>Descuento Aplicado:</span>
                      <span>- {formatearDinero(data.descuento_monto)}</span>
                    </div>
                  )}
                  {data.monto_impuesto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#0284c7' }}>
                      <span>{data.tipo_impuesto?.split(' ')[0] || 'Impuesto'}:</span>
                      <span>+ {formatearDinero(data.monto_impuesto)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #e5e7eb', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    <span>Total Final :</span>
                    <span>{formatearDinero(data.total_final)}</span>
                  </div>
                </div>
              </div>

              {/* Condiciones y Notas */}
              {data.condiciones_notas && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1f2937' }}>Condiciones y Notas:</h4>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {data.condiciones_notas}
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '20px 0', textAlign: 'center', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>
              NexoFix SpA | RUT: 76.543.210-K | Dirección: Av. Nueva Providencia 1234, Providencia, Santiago | contacto@nexofix.cl | Tel: +56 9 1234 5678
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
