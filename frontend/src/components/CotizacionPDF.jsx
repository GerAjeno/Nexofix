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

  const isBoleta = data.tipo_impuesto?.includes('Boleta');

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
            <div style={{ background: 'linear-gradient(90deg, var(--primary) 0%, var(--success) 100%)', padding: '2rem 3rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Logo Oficial */}
                <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                  <img src="/logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.02em', lineHeight: '1' }}>NexoFix SpA</h1>
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
                  <div style={{ marginBottom: '4px' }}>Dirección del Trabajo: {data.direccion_trabajo || data.cliente_direccion || 'No registrada'}</div>
                  <div style={{ marginBottom: '4px' }}>Teléfono de Contacto: {data.telefono_contacto || 'No registrado'}</div>
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
                      <span style={{ fontWeight: 'bold', marginRight: '15px', color: '#4b5563' }}>Categoría:</span>
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
                  <tr style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', borderTopLeftRadius: '4px' }}>Descripción</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center', width: '80px' }}>Cant.</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right', width: '120px' }}>P. Neto</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right', width: '120px' }}>Total Neto</th>
                    {isBoleta && (
                      <th style={{ padding: '12px 15px', textAlign: 'right', width: '130px', borderTopRightRadius: '4px', backgroundColor: '#075985' }}>Total Boleta</th>
                    )}
                    {!isBoleta && (
                      <th style={{ padding: '0', borderTopRightRadius: '4px', width: '0' }}></th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.items && data.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ padding: '12px 15px', color: '#4b5563' }}>{item.descripcion}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', color: '#4b5563' }}>{item.cantidad}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'right', color: '#4b5563' }}>{formatearDinero(item.precio_unitario)}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'right', color: isBoleta ? '#4b5563' : '#1f2937', fontWeight: isBoleta ? 'normal' : '500' }}>
                        {formatearDinero(item.total)}
                      </td>
                      {isBoleta && (
                        <td style={{ padding: '12px 15px', textAlign: 'right', color: '#1f2937', fontWeight: 'bold', backgroundColor: '#f0f9ff' }}>
                          {formatearDinero(Math.round(item.total * 1.1525))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ width: '40%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563' }}>
                    <span>{isBoleta ? 'Subtotal Bruto:' : 'Subtotal Servicios:'}</span>
                    <span>{formatearDinero(data.subtotal)}</span>
                  </div>
                  {data.descuento_monto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#059669' }}>
                      <span>Descuento Aplicado:</span>
                      <span>- {formatearDinero(data.descuento_monto)}</span>
                    </div>
                  )}
                  {data.monto_impuesto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: isBoleta ? '#e11d48' : '#0284c7' }}>
                      <span>
                        {data.tipo_impuesto?.includes('Factura') ? 'IVA (19%)' : 
                         data.tipo_impuesto?.includes('Boleta') ? 'Retención (15.25%)' : 
                         'Impuesto'}:
                      </span>
                      <span>{isBoleta ? '-' : '+'} {formatearDinero(data.monto_impuesto)}</span>
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
