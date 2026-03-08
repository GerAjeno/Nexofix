export default function Dashboard() {
  return (
    <div className="card">
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Resumen general de NexoFix</p>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
           <h3>Total Clientes</h3>
           <p style={{ color: 'var(--primary)' }}>--</p>
        </div>
        <div className="card stat-card">
           <h3>Cotizaciones</h3>
           <p style={{ color: 'var(--success)' }}>--</p>
        </div>
        <div className="card stat-card">
           <h3>Tickets Activos</h3>
           <p style={{ color: 'var(--warning)' }}>--</p>
        </div>
      </div>
    </div>
  );
}
