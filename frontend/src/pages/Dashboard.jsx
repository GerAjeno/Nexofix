import { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/dashboard/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCLP = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Sincronizando centro de mando...</p>
        </div>
      </div>
    );
  }

  if (!stats) return <div style={{ padding: '2rem', textAlign: 'center' }}>Error al conectar con el servidor de datos.</div>;
  if (stats.error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}><h3>Error del Servidor</h3><p>{stats.error}</p></div>;

  return (
    <div className="page-container" style={{ padding: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Centro de Mando</h1>
        <p className="page-subtitle">Visión general y rendimiento del negocio en tiempo real</p>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>TOTAL CLIENTES</p>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>{stats.clientesTotal}</h2>
            </div>
            <div style={{ padding: '10px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Gestión activa de cartera
          </p>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #f1c40f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>PENDIENTE COBRO</p>
              <h2 style={{ fontSize: '2rem', margin: 0, color: '#f1c40f' }}>{formatCLP(stats.finanzas.pendiente)}</h2>
            </div>
            <div style={{ padding: '10px', background: 'rgba(241, 196, 15, 0.1)', borderRadius: '12px', color: '#f1c40f' }}>
              <Clock size={24} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6 }}>Flujo proyectado en recaudación</p>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #2ecc71' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>CASH FLOW (COBRADO)</p>
              <h2 style={{ fontSize: '2rem', margin: 0, color: '#2ecc71' }}>{formatCLP(stats.finanzas.cobrado)}</h2>
            </div>
            <div style={{ padding: '10px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '12px', color: '#2ecc71' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6 }}>Ingresos reales consolidados</p>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem' }}>TICKETS ACTIVOS</p>
              <h2 style={{ fontSize: '2rem', margin: 0, color: '#e74c3c' }}>{stats.operaciones.pendiente + stats.operaciones.enProceso}</h2>
            </div>
            <div style={{ padding: '10px', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '12px', color: '#e74c3c' }}>
              <ClipboardList size={24} />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6 }}>Carga técnica actual en terreno</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Próximos Trabajos (Agenda) */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Agenda Inmediata
            </h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Top 5 compromisos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.proximosTrabajos.length > 0 ? (
              stats.proximosTrabajos.map(t => (
                <div key={t.id} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{t.cliente_nombre}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{t.tipo_trabajo}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>{t.fecha_agendada}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{t.jornada}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No hay trabajos agendados.</div>
            )}
          </div>
        </div>

        {/* Actividad Financiera Reciente */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#2ecc71" /> Movimientos Recientes
            </h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Flujo de caja</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.actividadReciente.length > 0 ? (
              stats.actividadReciente.map((a, i) => (
                <div key={i} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '8px',
                      background: a.estado === 'Cobrado' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                      borderRadius: '50%',
                      color: a.estado === 'Cobrado' ? '#2ecc71' : '#f1c40f'
                    }}>
                      {a.estado === 'Cobrado' ? <CheckCircle2 size={16} /> : <FileCheck size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{a.numero_cobro}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{a.cliente_nombre}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{formatCLP(a.monto_total)}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{a.estado}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Sin movimientos recientes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
