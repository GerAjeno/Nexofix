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
            
            {/* Header Estilo Imagen de Muestra */}
            <div style={{ backgroundColor: '#10b981', padding: '1.5rem 3rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                  <img src="/logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '500', letterSpacing: '0.5px' }}>NexoFix</h1>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '-5px' }}>Servicios Integrales</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '400', letterSpacing: '1px' }}>ORDEN DE TRABAJO</h2>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>N° TCK-{data.numero_ticket}</div>
              </div>
            </div>

            {/* Cuerpo del PDF */}
            <div style={{ padding: '3rem' }}>
              
              {/* Info Cliente y Detalles del Servicio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#374151', fontWeight: '600' }}>Datos del Cliente:</h3>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Cliente: {data.cliente_nombre}</div>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>RUT: {data.cliente_rut}</div>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Dirección: {data.direccion_trabajo || data.cliente_direccion}</div>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Teléfono: {data.telefono_contacto || data.cliente_telefono}</div>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#374151', fontWeight: '600' }}>Detalles del Servicio:</h3>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Título: {data.proyecto_nombre || 'Servicio General'}</div>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Fecha Programada: {formatearFecha(data.fecha_creacion)}</div>
                  <div style={{ marginBottom: '6px', color: '#4b5563' }}>Categoría: {data.tipo_trabajo || 'No especificada'}</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '2.5rem' }} />

              {/* Bitácora / Descripción */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '18px', color: '#374151', fontWeight: '600' }}>Bitácora Técnica / Descripción Tareas:</h3>
                
                <div style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {data.descripcion_problema || data.descripcion_cotizada}
                </div>

                {/* Ítems como lista según imagen */}
                {data.items && data.items.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>--- Materiales / Insumos Cotizados ---</div>
                    {data.items.map((item, index) => (
                      <div key={index} style={{ paddingLeft: '10px' }}>
                        - {item.cantidad}x {item.descripcion}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ color: '#4b5563' }}>
                  <div style={{ fontWeight: '500', marginBottom: '8px' }}>--- PROBLEMA REPORTADO (Agenda) ---</div>
                  <div style={{ paddingLeft: '10px' }}>{data.descripcion_problema || 'No especificado'}</div>
                </div>
              </div>

              {/* Observaciones en Terreno */}
              <div style={{ marginBottom: '5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#374151', fontWeight: '600' }}>Observaciones en Terreno (Llenar a mano):</h3>
                <div style={{ 
                  width: '100%', 
                  height: '180px', 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '4px' 
                }}></div>
              </div>

              {/* Firma Cliente */}
              <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ width: '350px', margin: '0 auto', borderTop: '1px solid #9ca3af', paddingTop: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Firma de Conformidad Cliente</div>
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
