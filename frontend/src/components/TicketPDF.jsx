import React, { useRef } from 'react';
import { Download, ShieldCheck, MapPin, Phone, User, Calendar, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function TicketPDF({ data, onClose }) {
  const printRef = useRef();

  if (!data) return null;

  const handleDownload = () => {
    const element = printRef.current;
    
    const opt = {
      margin:       0,
      filename:     `OT-${data.numero_ticket}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    // Si ya viene formateada o es ISO
    if (fechaString.includes('-')) {
      const [year, month, day] = fechaString.split('-');
      return `${day}/${month}/${year}`;
    }
    return fechaString;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '850px', backgroundColor: '#e2e8f0', padding: '1rem', borderRadius: '8px' }}>
        
        {/* Controles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Vista Previa Orden de Trabajo</h3>
          <div>
            <button className="btn-secondary" onClick={onClose} style={{ marginRight: '1rem' }}>
              Cerrar
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-top' }} /> 
              Descargar OT
            </button>
          </div>
        </div>

        {/* Documento OT */}
        <div style={{ margin: '0 auto', background: '#ffffff', width: '8.5in', minHeight: '11in', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div ref={printRef} style={{ width: '100%', minHeight: '11in', background: '#fff', color: '#333', fontFamily: '"Arial", sans-serif', fontSize: '14px', lineHeight: 1.5 }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(90deg, #007bff 0%, #28a745 100%)', padding: '2rem 3rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>NexoFix SpA</h1>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>Orden de Trabajo Técnica</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'normal' }}>ORDEN DE TRABAJO</h2>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>N° {data.numero_ticket}</div>
              </div>
            </div>

            {/* Cuerpo del PDF */}
            <div style={{ padding: '2.5rem 3rem' }}>
              
              {/* Info Cliente y Proyecto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#007bff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> Datos del Cliente
                  </h3>
                  <div style={{ marginBottom: '6px' }}><strong>Nombre:</strong> {data.cliente_nombre}</div>
                  <div style={{ marginBottom: '6px' }}><strong>RUT:</strong> {data.cliente_rut}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Teléfono:</strong> {data.telefono_contacto || data.cliente_telefono || 'No registrado'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Dirección:</strong> {data.direccion_trabajo || data.cliente_direccion || 'No registrada'}</div>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#007bff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} /> Detalles del Servicio
                  </h3>
                  <div style={{ marginBottom: '6px' }}><strong>Proyecto:</strong> {data.proyecto_nombre || 'Servicio General'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Tipo de Trabajo:</strong> {data.tipo_trabajo || 'No especificado'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Fecha Inicio:</strong> {formatearFecha(data.fecha_creacion)}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Prioridad:</strong> {data.prioridad}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Estado:</strong> {data.estado}</div>
                </div>
              </div>

              {/* Descripción del Requerimiento Original */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                  Resumen del Requerimiento:
                </h4>
                <div style={{ padding: '8px 0', color: '#4b5563', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                  {data.descripcion_problema}
                </div>
              </div>

              {/* Detalle de Ítems (Itemizado) */}
              {data.items && data.items.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                    Detalle de Ítems y Cantidades (Matriz de Trabajo):
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#475569' }}>Descripción / Material / Servicio</th>
                        <th style={{ padding: '8px', textAlign: 'center', color: '#475569', width: '120px' }}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px', color: '#1e293b' }}>{item.descripcion}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#1e293b' }}>{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Condiciones y Notas de la Cotización */}
              {data.cotizacion_condiciones && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                    Notas y Condiciones de la Cotización:
                  </h4>
                  <div style={{ padding: '10px', color: '#64748b', fontSize: '12px', background: '#f8fafc', borderRadius: '4px', fontStyle: 'italic', lineHeight: '1.4' }}>
                    {data.cotizacion_condiciones}
                  </div>
                </div>
              )}

              {/* Notas Técnicas / Observaciones de Terreno */}
              <div style={{ marginBottom: '4rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                  Observaciones Técnicas de Terreno (A completar por técnico):
                </h4>
                <div style={{ padding: '10px 0', color: '#4b5563', whiteSpace: 'pre-wrap', minHeight: '60px', fontStyle: 'italic', borderBottom: '1px dashed #cbd5e1' }}>
                  {data.notas_tecnicas || 'Espacio para observaciones adicionales durante la ejecución...'}
                </div>
              </div>

              {/* Cuadros de Firma */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Firma Técnico Responsable</div>
                    <div style={{ fontSize: '12px' }}>NexoFix SpA</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Firma del Cliente</div>
                    <div style={{ fontSize: '12px' }}>Conformidad del Servicio</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '20px 0', textAlign: 'center', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>
              NexoFix SpA | OT Generada Automáticamente | contacto@nexofix.cl
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
