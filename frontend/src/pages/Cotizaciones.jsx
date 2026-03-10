import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Edit2, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { cotizacionesService } from '../services/cotizacionesService';
import CotizacionForm from '../components/CotizacionForm';
import CotizacionPDF from '../components/CotizacionPDF';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  // Estados para envío silencioso de email
  const [emailData, setEmailData] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [destinatario, setDestinatario] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

    // Registrar el listener global que permite al modal invocar el envío de correos al cerrarse
    window.triggerCotizacionEmail = async (cotizacionId, emailTo) => {
      try {
        setDestinatario(emailTo);
        setIsSendingEmail(true); // Mostrar modal de carga
        const data = await cotizacionesService.getById(cotizacionId);
        setEmailData(data); // Esto renderizará CotizacionPDF invisiblemente para capturar el base64
      } catch (err) {
        setIsSendingEmail(false);
        alert('Error preparando información para el correo.');
        console.error(err);
      }
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      delete window.triggerCotizacionEmail;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDelete = async (id, numero) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar (archivar) la cotización ${numero}?`)) {
      try {
        await cotizacionesService.delete(id);
        loadCotizaciones();
      } catch (err) {
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

  // Disparado manualmente desde el botón "Enviar Email"
  const handleManualEmail = (cotizacionId) => {
    const emailTo = prompt("Ingrese el correo electrónico del cliente para enviar la Cotización", "");
    if (emailTo && emailTo.trim() !== "") {
      window.triggerCotizacionEmail(cotizacionId, emailTo);
    }
  };

  // Se ejecuta cuando el Componente PDF Oculto termina de generar el Base64
  const processEmailSend = async (base64String) => {
    try {
      const payload = {
        cotizacionId: emailData.id,
        clienteEmail: destinatario,
        base64Pdf: base64String,
        clienteNombre: emailData.cliente_nombre || 'Cliente',
        numeroCotizacion: emailData.numero_cotizacion
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/email/enviar-cotizacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error enviando correo.');

      alert('¡Cotización enviada exitosamente por correo electrónico!');
    } catch (err) {
      console.error(err);
      alert('Hubo un error al intentar enviar el correo: ' + err.message);
    } finally {
      // Limpiar estados
      setIsSendingEmail(false);
      setEmailData(null);
      setDestinatario('');
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

      <div className="table-container" style={{ display: isMobile ? 'none' : 'block' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Cotización</th>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Cliente</th>
              <th>Total</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
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
                <td style={{ textAlign: 'right' }}>
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
                      onClick={() => handleManualEmail(cot.id)}
                      className="icon-btn"
                      style={{ color: '#0ea5e9' }}
                      title="Enviar por Correo"
                    >
                      <Mail size={18} />
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

      {isMobile && (
        <div className="mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {cotizaciones.length > 0 ? (
            cotizaciones.map(cot => (
              <div key={cot.id} style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', borderTop: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>N° {cot.numero_cotizacion}</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(cot.fecha_emision + 'T12:00:00').toLocaleDateString('es-CL')}</span>
                </div>
                <div style={{ marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: '500' }}>
                  {cot.cliente_nombre || 'Cliente Desconocido'}
                </div>
                <div style={{ marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <strong>Proyecto:</strong> {cot.proyecto || '-'}
                </div>
                <div style={{ marginBottom: '1.2rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  Total: ${cot.total_final?.toLocaleString('es-CL')}
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" style={{ flex: '1 0 calc(50% - 5px)', padding: '10px', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleAccept(cot.id, cot.numero_cotizacion)}>
                    <CheckCircle size={16} /> Aceptar
                  </button>
                  <button className="btn-secondary" style={{ flex: '1 0 calc(50% - 5px)', padding: '10px', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', borderColor: '#0ea5e9', color: '#0ea5e9' }} onClick={() => handleManualEmail(cot.id)}>
                    <Mail size={16} /> Enviar
                  </button>
                  <button className="btn-secondary" style={{ flex: '1 0 calc(33% - 6px)', padding: '8px' }} onClick={() => handeOpenPdf(cot.id)}>PDF</button>
                  <button className="btn-secondary" style={{ flex: '1 0 calc(33% - 6px)', padding: '8px' }} onClick={() => { setSelectedCotizacion(cot); setShowModal(true); }}>Editar</button>
                  <button className="btn-secondary" style={{ flex: '1 0 calc(33% - 7px)', padding: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(cot.id, cot.numero_cotizacion)}>X</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>No hay cotizaciones registradas.</div>
          )}
        </div>
      )}

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

      {/* Renderizador PDF estricto y oculto para el Email */}
      {emailData && (
        <CotizacionPDF
          data={emailData}
          onClose={() => setEmailData(null)}
          modoOculto={true}
          onEmailReady={(base64) => processEmailSend(base64)}
        />
      )}

      {/* Pantalla de Carga Central */}
      {isSendingEmail && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem 3rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <Loader2 size={48} className="text-primary" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Procesando Cotización...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Generando PDF seguro y conectando con el servidor de correos.</p>
          </div>
        </div>
      )}
    </div>
  );
}
