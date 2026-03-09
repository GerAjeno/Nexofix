import React, { useRef, useState, useEffect } from 'react';
import { Download, ShieldCheck, MapPin, Phone, User, Calendar, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getAjustesGenerales } from '../services/ajustesService';

export default function TicketPDF({ data, onClose }) {
  const printRef = useRef();
  const [empresa, setEmpresa] = useState({
    empresa_nombre: 'NexoFix SpA',
    banco_email: 'contacto@nexofix.cl'
  });

  useEffect(() => {
    getAjustesGenerales().then(data => {
      if(data.empresa_nombre) {
        setEmpresa(data);
      }
    }).catch(err => console.error("Error cargando ajustes en TicketPDF", err));
  }, []);

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
            <div style={{ background: 'linear-gradient(90deg, #007bff 0%, #28a745 100%)', padding: '1.5rem 2.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{empresa.empresa_nombre}</h1>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>Orden de Trabajo Técnica</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'normal' }}>ORDEN DE TRABAJO</h2>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>N° {data.numero_ticket}</div>
              </div>
            </div>

            {/* Cuerpo del PDF */}
            <div style={{ padding: '1.5rem 2.5rem' }}>
              
              {/* Info Cliente y Proyecto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
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
                </div>
              </div>

              {/* Descripción del Requerimiento */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                  Descripción del Trabajo Relizado / Requerimiento:
                </h4>
                <div style={{ padding: '10px 0', color: '#4b5563', whiteSpace: 'pre-wrap', minHeight: '80px' }}>
                  {data.descripcion_problema || data.descripcion_cotizada}
                </div>
              </div>

              {/* Itemizado Técnico (Sin Precios) */}
              {data.items && data.items.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                    Detalle de Ítems / Materiales Cotizados:
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e2e8f0', width: '70%' }}>Descripción del Item</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.descripcion}</td>
                          <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notas Técnicas / Observaciones */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px', color: '#1f2937' }}>
                  Notas Técnicas y Observaciones del Terreno:
                </h4>
                <div style={{ padding: '10px 0', color: '#4b5563', whiteSpace: 'pre-wrap', minHeight: '100px', fontStyle: 'italic' }}>
                  {data.notas_tecnicas || ''}
                </div>
              </div>



              {/* Cuadros de Firma */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '3.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Firma Técnico Responsable</div>
                    <div style={{ fontSize: '12px' }}>{empresa.empresa_nombre}</div>
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
              {empresa.empresa_nombre} | OT Generada Automáticamente | {empresa.banco_email}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
