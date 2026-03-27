import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Clientes Activos
    const clientesPromise = db.collection('clientes').where('activo', '==', 1).count().get().then(snap => snap.data().count);

    // 2. Finanzas (Cobrado vs Pendiente)
    const finanzasPromise = db.collection('cobranzas').where('activo', '==', 1).get().then(snap => {
      const fin = { cobrado: 0, pendiente: 0 };
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.estado === 'Cobrado') fin.cobrado += (data.monto_total || 0);
        if (data.estado === 'En Cobro') fin.pendiente += (data.monto_total || 0);
      });
      return fin;
    });

    // 3. Operaciones (Tickets Activos)
    const operacionesPromise = db.collection('tickets').where('activo', '==', 1).get().then(snap => {
      const ops = { pendiente: 0, enProceso: 0, terminado: 0 };
      snap.docs.forEach(doc => {
        const est = doc.data().estado;
        if (est === 'Pendiente') ops.pendiente += 1;
        if (est === 'En Proceso') ops.enProceso += 1;
        if (est === 'Terminado') ops.terminado += 1;
      });
      return ops;
    });

    // 4. Próximos Trabajos (Top 5 No Terminados) - Filtrado en memoria para evitar requerir Índices Compuestos en Firebase
    const proximosPromise = db.collection('tickets')
      .where('activo', '==', 1)
      .get()
      .then(async snap => {
        let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filtro en memoria
        rows = rows.filter(r => r.estado === 'Pendiente' || r.estado === 'En Proceso');
        
        // Orden ascendente
        rows.sort((a, b) => {
           if (!a.fecha_agendada) return 1;
           if (!b.fecha_agendada) return -1;
           return a.fecha_agendada.localeCompare(b.fecha_agendada);
        });
        
        rows = rows.slice(0, 5);

        // Resolver cliente
        for (const t of rows) {
          if (t.cliente_id) {
            const cli = await db.collection('clientes').doc(t.cliente_id).get();
            if (cli.exists) t.cliente_nombre = cli.data().nombre;
          }
        }
        return rows;
      });

    // 5. Actividad Reciente (Últimas 5 cobranzas) - Filtrado en memoria
    const actividadPromise = db.collection('cobranzas')
      .where('activo', '==', 1)
      .get()
      .then(async snap => {
        let rows = snap.docs.map(d => ({ 
          numero_cobro: d.data().numero_cobro, 
          monto_total: d.data().monto_total, 
          fecha_creacion: d.data().fecha_creacion, 
          estado: d.data().estado,
          cliente_id: d.data().cliente_id,
          created_at: d.data().created_at || d.data().fecha_creacion || ''
        }));
        
        rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
        rows = rows.slice(0, 5);

        // Resolver cliente
        for (const c of rows) {
          if (c.cliente_id) {
            const cli = await db.collection('clientes').doc(c.cliente_id).get();
            if (cli.exists) c.cliente_nombre = cli.data().nombre;
          }
        }
        return rows;
      });

    const [clientesTotal, finanzas, operaciones, proximosTrabajos, actividadReciente] = await Promise.all([
      clientesPromise, finanzasPromise, operacionesPromise, proximosPromise, actividadPromise
    ]);

    res.json({
      clientesTotal,
      finanzas,
      operaciones,
      proximosTrabajos,
      actividadReciente
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
