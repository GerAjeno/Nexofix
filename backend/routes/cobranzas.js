import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todas las cobranzas activas
router.get('/', (req, res) => {
  const sql = `
    SELECT cob.*, c.nombre as cliente_nombre, t.numero_ticket, t.tipo_trabajo, cot.proyecto as proyecto_nombre
    FROM cobranzas cob
    LEFT JOIN clientes c ON cob.cliente_id = c.id
    LEFT JOIN tickets t ON cob.ticket_id = t.id
    LEFT JOIN cotizaciones cot ON cob.cotizacion_id = cot.id
    WHERE cob.activo = 1
    ORDER BY cob.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET detalle de cobranza por ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT cob.*, 
           c.nombre as cliente_nombre, c.rut as cliente_rut, c.telefono as cliente_telefono, c.direccion as cliente_direccion,
           t.numero_ticket, t.tipo_trabajo, t.descripcion_problema, t.notas_tecnicas, t.fecha_termino,
           cot.proyecto as proyecto_nombre, cot.numero_cotizacion, cot.descripcion_trabajo as descripcion_cotizada,
           cot.subtotal, cot.monto_impuesto, cot.tipo_impuesto, cot.total_final
    FROM cobranzas cob
    LEFT JOIN clientes c ON cob.cliente_id = c.id
    LEFT JOIN tickets t ON cob.ticket_id = t.id
    LEFT JOIN cotizaciones cot ON cob.cotizacion_id = cot.id
    WHERE cob.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cobranza no encontrada' });

    // Traer ítems si hay cotización
    if (row.cotizacion_id) {
      const sqlItems = `SELECT descripcion, cantidad, precio_unitario, total FROM cotizacion_items WHERE cotizacion_id = ?`;
      db.all(sqlItems, [row.cotizacion_id], (errItems, items) => {
        res.json({ ...row, items: items || [] });
      });
    } else {
      res.json({ ...row, items: [] });
    }
  });
});

// PUT actualizar estado de cobranza
router.put('/:id', (req, res) => {
  const { estado } = req.body;
  const sql = `UPDATE cobranzas SET estado = ? WHERE id = ?`;
  db.run(sql, [estado, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// DELETE (soft) cobranza
router.delete('/:id', (req, res) => {
  db.run('UPDATE cobranzas SET activo = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ archived: this.changes });
  });
});

export default router;
