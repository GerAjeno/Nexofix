import { useState, useEffect } from 'react';
import { DollarSign, Search, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { cobranzasService } from '../services/cobranzasService';
import CobranzaPDF from '../components/CobranzaPDF';
import PaymentModal from '../components/PaymentModal';

export default function Cobranzas() {
  const [cobranzas, setCobranzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [showPDF, setShowPDF] = useState(false);
  const [selectedCobranzaId, setSelectedCobranzaId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Estados para Registro de Pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState(null);

  const fetchCobranzas = async () => {
    try {
      setLoading(true);
      const data = await cobranzasService.getAll();
      setCobranzas(data);
    } catch (error) {
      console.error('Error al cargar cobranzas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCobranzas();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await cobranzasService.update(id, { estado: nuevoEstado });
      fetchCobranzas();
    } catch (error) {
      alert('Error al actualizar el estado del cobro');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este registro de cobro?')) {
      try {
        await cobranzasService.delete(id);
        fetchCobranzas();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  const filtered = cobranzas.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (c.numero_cobro || '').toLowerCase().includes(s) || 
                         (c.cliente_nombre || '').toLowerCase().includes(s) ||
                         (c.numero_ticket || '').toLowerCase().includes(s);
    const matchesEstado = filterEstado === 'Todos' || c.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getStatusStyle = (estado) => {
    switch(estado) {
      case 'Cobrado': return { bg: 'rgba(40, 167, 69, 0.2)', color: '#28a745', icon: <CheckCircle size={14} /> };
      case 'Rechazado': return { bg: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', icon: <XCircle size={14} /> };
      default: return { bg: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', icon: <Clock size={14} /> };
    }
  };

  const formatCLP = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Gestión de Cobranzas</h1>
          <p className="page-subtitle">Seguimiento financiero de trabajos finalizados</p>
        </div>
      </div>

      <div className="filters-bar card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por COB, Ticket o Cliente..." 
            className="form-control" 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="form-control" 
          style={{ width: '200px' }}
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="Todos">Todos los estados</option>
          <option value="En Cobro">En Cobro</option>
          <option value="Cobrado">Cobrado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando registros financieros...</div>
      ) : (
        <>
        <div className="table-container" style={{ display: isMobile ? 'none' : 'block' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Cobro</th>
                <th>Ticket Origen</th>
                <th>Cliente / Proyecto</th>
                <th>Fecha Emisión</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Monto Total</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(cob => {
                  const status = getStatusStyle(cob.estado);
                  return (
                    <tr key={cob.id}>
                      <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{cob.numero_cobro}</td>
                      <td style={{ opacity: 0.8 }}>{cob.numero_ticket || '-'}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{cob.cliente_nombre}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{cob.proyecto_nombre || 'Sin Proyecto'}</div>
                      </td>
                      <td>{new Date(cob.fecha_creacion + 'T12:00:00').toLocaleDateString('es-CL')}</td>
                      <td>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                          backgroundColor: status.bg, color: status.color
                        }}>
                          {status.icon} {cob.estado}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {formatCLP(cob.monto_total)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="icon-btn" title="Ver Reporte PDF" onClick={() => { setSelectedCobranzaId(cob.id); setShowPDF(true); }}>
                            <FileText size={18} />
                          </button>
                          {cob.estado === 'En Cobro' && (
                            <button className="icon-btn" title="Marcar como Cobrado" onClick={() => {
                              setSelectedForPayment(cob);
                              setShowPaymentModal(true);
                            }} style={{ color: '#28a745' }}>
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button className="icon-btn delete" title="Quitar" onClick={() => handleDelete(cob.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                    No se encontraron registros de cobro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isMobile && (
          <div className="mobile-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {filtered.length > 0 ? (
              filtered.map(cob => {
                const status = getStatusStyle(cob.estado);
                return (
                  <div key={cob.id} style={{ background: 'var(--card-bg)', borderRadius: '8px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', borderLeft: `4px solid ${status.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', display: 'block' }}>{cob.numero_cobro}</strong>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                        backgroundColor: status.bg, color: status.color
                      }}>
                        {status.icon} {cob.estado}
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: '500' }}>
                      {cob.cliente_nombre}
                    </div>
                    <div style={{ marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      <strong>Ticket:</strong> {cob.numero_ticket || '-'} | <strong>Proyecto:</strong> {cob.proyecto_nombre || 'Sin Proyecto'}
                    </div>
                    <div style={{ marginBottom: '1.2rem', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {formatCLP(cob.monto_total)}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {cob.estado === 'En Cobro' && (
                        <button className="btn-secondary" style={{ flex: '1 0 calc(50% - 5px)', padding: '10px', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', borderColor: '#28a745', color: '#28a745' }} onClick={() => {
                          setSelectedForPayment(cob);
                          setShowPaymentModal(true);
                        }}>
                          <CheckCircle size={16} /> Cobrar
                        </button>
                      )}
                      <button className="btn-secondary" style={{ flex: cob.estado === 'En Cobro' ? '1 0 calc(50% - 5px)' : '1 0 calc(50% - 5px)', padding: '10px', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }} onClick={() => { setSelectedCobranzaId(cob.id); setShowPDF(true); }}>
                        <FileText size={16} /> PDF
                      </button>
                      <button className="btn-secondary" style={{ flex: cob.estado === 'En Cobro' ? '1 0 100%' : '1 0 calc(50% - 5px)', padding: '10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleDelete(cob.id)}>
                        <Trash2 size={16} /> Quitar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                No se encontraron registros de cobro.
              </div>
            )}
          </div>
        )}
        </>
      )}

      {showPDF && selectedCobranzaId && (
        <CobranzaPDF 
          cobranzaId={selectedCobranzaId} 
          onClose={() => { setShowPDF(false); setSelectedCobranzaId(null); }} 
        />
      )}

      {showPaymentModal && selectedForPayment && (
        <PaymentModal 
          cobranza={selectedForPayment}
          onClose={() => { setShowPaymentModal(false); setSelectedForPayment(null); }}
          onSave={() => {
            setShowPaymentModal(false);
            setSelectedForPayment(null);
            fetchCobranzas();
          }}
        />
      )}
    </div>
  );
}

