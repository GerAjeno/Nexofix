import { useRef } from 'react';
import { Download, MapPin, Phone, User, Calendar, FileText, DollarSign, ClipboardCheck } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function CobranzaPDF({ cobranzaId, onClose }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const printRef = useRef();

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/cobranzas/${cobranzaId}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Error cargando cobranza para PDF:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [cobranzaId]);

  if (loading) return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
        Generando vista previa...
      </div>
    </div>
  );

  if (!data) return null;

  const handleDownload = () => {
    const element = printRef.current;
    const opt = {
      margin:       0,
      filename:     `COB-${data.numero_cobro}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val || 0);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, overflowY: 'auto' }}>
      <div className="modal-content" style={{ maxWidth: '850px', backgroundColor: '#e2e8f0', padding: '1rem', borderRadius: '8px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Reporte Consolidado de Cobro</h3>
          <div>
            <button className="btn-secondary" onClick={onClose} style={{ marginRight: '1rem' }}>Cerrar</button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={18} style={{ marginRight: '8px' }} /> Descargar PDF
            </button>
          </div>
        </div>

        <div style={{ margin: '0 auto', background: '#ffffff', width: '8.5in', minHeight: '11in', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div ref={printRef} style={{ width: '100%', minHeight: '11in', background: '#fff', color: '#333', fontFamily: '"Arial", sans-serif', fontSize: '13px', lineHeight: 1.4 }}>
            
            {/* Header */}
            <div style={{ background: '#007bff', padding: '1.5rem 2.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>NexoFix SpA</h1>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>Gestión y Recaudación Profesional</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'normal' }}>DETALLE DE COBRANZA</h2>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.numero_cobro}</div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2.5rem' }}>
              {/* Info Cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#007bff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} /> Información del Cliente
                  </h3>
                  <div><strong>Cliente:</strong> {data.cliente_nombre}</div>
                  <div><strong>RUT:</strong> {data.cliente_rut}</div>
                  <div><strong>Dirección:</strong> {data.direccion_trabajo || data.cliente_direccion}</div>
                </div>
                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#007bff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} /> Datos de Referencia
                  </h3>
                  <div><strong>Fecha Emisión:</strong> {new Date(data.fecha_creacion + 'T12:00:00').toLocaleDateString('es-CL')}</div>
                  <div><strong>N° Ticket:</strong> {data.numero_ticket}</div>
                  <div><strong>Proyecto:</strong> {data.proyecto_nombre || 'S/P'}</div>
                </div>
              </div>

              {/* Descripciones Técnicas */}
              <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #e2e8f0', color: '#1f2937' }}>
                    Descripción Cotizada:
                  </h4>
                  <div style={{ padding: '5px 0', fontSize: '12px', color: '#4b5563', whiteSpace: 'pre-wrap' }}>
                    {data.descripcion_cotizada || data.tipo_trabajo}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #e2e8f0', color: '#1f2937' }}>
                    Reporte de Trabajo Realizado:
                  </h4>
                  <div style={{ padding: '5px 0', fontSize: '12px', color: '#4b5563', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                    {data.notas_tecnicas}
                    {data.fecha_termino && <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Finalizado el: {data.fecha_termino}</div>}
                  </div>
                </div>
              </div>

              {/* Itemizado Comercial */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={14} /> Detalle de Materiales y Servicios
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Descripción</th>
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>Cant.</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>Unitario</th>
                      <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.descripcion}</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{item.cantidad}</td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{formatCLP(item.precio_unitario)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{formatCLP(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div style={{ marginLeft: 'auto', width: '250px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <span>{formatCLP(data.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{data.tipo_impuesto}:</span>
                  <span>{formatCLP(data.monto_impuesto)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
                  <span>TOTAL A PAGAR:</span>
                  <span>{formatCLP(data.total_final)}</span>
                </div>
              </div>

              {/* Pie de Firma */}
              <div style={{ marginTop: '3rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                  <ClipboardCheck size={20} />
                  <span>Documento de conciliación técnica y comercial generado por NexoFix SpA</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '15px 0', textAlign: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #f1f5f9' }}>
              Este documento es un comprobante de servicio y cobro. | NexoFix SpA | contacto@nexofix.cl
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
