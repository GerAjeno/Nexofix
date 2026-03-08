import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todas las cotizaciones activas
router.get('/', (req, res) => {
  const sql = `
    SELECT c.*, cl.nombre as cliente_nombre, cl.rut as cliente_rut
    FROM cotizaciones c
    LEFT JOIN clientes cl ON c.cliente_id = cl.id
    WHERE c.activo = 1
    ORDER BY c.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET una sola cotización con sus ítems y datos del cliente
router.get('/:id', (req, res) => {
  const sqlCotizacion = `
    SELECT c.*, cl.nombre as cliente_nombre, cl.rut as cliente_rut, cl.direccion as cliente_direccion, cl.email as cliente_email
    FROM cotizaciones c
    LEFT JOIN clientes cl ON c.cliente_id = cl.id
    WHERE c.id = ? AND c.activo = 1
  `;
  
  db.get(sqlCotizacion, [req.params.id], (err, cotizacion) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });

    db.all('SELECT * FROM cotizacion_items WHERE cotizacion_id = ?', [cotizacion.id], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      cotizacion.items = items || [];
      res.json(cotizacion);
    });
  });
});

// POST nueva cotización (Transacción con Ítems)
router.post('/', (req, res) => {
  const { 
    cliente_id, fecha_emision, validez, proyecto, descripcion_trabajo, 
    subtotal, descuento_porcentaje, descuento_monto, tipo_impuesto, monto_impuesto, total_final, 
    condiciones_notas, items 
  } = req.body;

  // Generar número de cotización único si no viene provisto (e.g. COT-X)
  const numero_cotizacion = req.body.numero_cotizacion || `COT-${Date.now().toString().slice(-6)}`;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const sqlInsertCotizacion = `
      INSERT INTO cotizaciones (
        numero_cotizacion, cliente_id, fecha_emision, validez, proyecto, 
        descripcion_trabajo, subtotal, descuento_porcentaje, descuento_monto, 
        tipo_impuesto, monto_impuesto, total_final, condiciones_notas, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const params = [
      numero_cotizacion, cliente_id, fecha_emision, validez, proyecto,
      descripcion_trabajo, subtotal, descuento_porcentaje, descuento_monto,
      tipo_impuesto, monto_impuesto, total_final, condiciones_notas
    ];

    db.run(sqlInsertCotizacion, params, function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      const cotizacionId = this.lastID;

      // Insertar los ítems
      if (items && items.length > 0) {
        const stmt = db.prepare('INSERT INTO cotizacion_items (cotizacion_id, descripcion, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)');
        
        for (const item of items) {
          stmt.run([cotizacionId, item.descripcion, item.cantidad, item.precio_unitario, item.total]);
        }
        stmt.finalize();
      }

      db.run('COMMIT', (errCommit) => {
        if (errCommit) return res.status(500).json({ error: errCommit.message });
        res.status(201).json({ id: cotizacionId, numero_cotizacion, message: 'Cotización creada exitosamente' });
      });
    });
  });
});

// DELETE (Borrado Suave / Archivar) cotización
router.delete('/:id', (req, res) => {
  db.run('UPDATE cotizaciones SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json({ message: 'Cotización archivada exitosamente' });
  });
});

export default router;
