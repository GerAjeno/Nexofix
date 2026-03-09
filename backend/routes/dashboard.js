import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // 1. Total Clientes
    const clientesPromise = new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as total FROM clientes WHERE activo = 1", (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });

    // 2. Finanzas (Cobrado vs Pendiente)
    const finanzasPromise = new Promise((resolve, reject) => {
      db.all("SELECT estado, SUM(monto_total) as total FROM cobranzas WHERE activo = 1 GROUP BY estado", (err, rows) => {
        if (err) reject(err);
        else {
          const fin = { cobrado: 0, pendiente: 0 };
          rows.forEach(r => {
            if (r.estado === 'Cobrado') fin.cobrado = r.total;
            if (r.estado === 'En Cobro') fin.pendiente = r.total;
          });
          resolve(fin);
        }
      });
    });

    // 3. Operaciones (Tickets Activos)
    const operacionesPromise = new Promise((resolve, reject) => {
      db.all("SELECT estado, COUNT(*) as cantidad FROM tickets WHERE activo = 1 GROUP BY estado", (err, rows) => {
        if (err) reject(err);
        else {
          const ops = { pendiente: 0, enProceso: 0, terminado: 0 };
          rows.forEach(r => {
            if (r.estado === 'Pendiente') ops.pendiente = r.cantidad;
            if (r.estado === 'En Proceso') ops.enProceso = r.cantidad;
            if (r.estado === 'Terminado') ops.terminado = r.cantidad;
          });
          resolve(ops);
        }
      });
    });

    // 4. Próximos Trabajos (Top 5)
    const proximosPromise = new Promise((resolve, reject) => {
      const sql = `
        SELECT t.*, c.nombre as cliente_nombre 
        FROM tickets t 
        JOIN clientes c ON t.cliente_id = c.id 
        WHERE t.estado != 'Terminado' AND t.activo = 1 
        AND t.fecha_agendada IS NOT NULL
        ORDER BY t.fecha_agendada ASC LIMIT 5
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 5. Actividad Reciente (Últimas 5 cobranzas generadas)
    const actividadPromise = new Promise((resolve, reject) => {
      const sql = `
        SELECT cob.numero_cobro, cob.monto_total, c.nombre as cliente_nombre, cob.fecha_creacion, cob.estado
        FROM cobranzas cob
        JOIN clientes c ON cob.cliente_id = c.id
        WHERE cob.activo = 1
        ORDER BY cob.id DESC LIMIT 5
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
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
