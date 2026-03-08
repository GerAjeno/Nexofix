import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todos los tickets activos
router.get('/', (req, res) => {
  const sql = `
    SELECT t.*, c.nombre as cliente_nombre 
    FROM tickets t
    JOIN clientes c ON t.cliente_id = c.id
    WHERE t.activo = 1
    ORDER BY t.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET un ticket por ID
router.get('/:id', (req, res) => {
  const sql = `
    SELECT t.*, c.nombre as cliente_nombre, c.rut as cliente_rut, c.telefono as cliente_telefono, c.direccion as cliente_direccion
    FROM tickets t
    JOIN clientes c ON t.cliente_id = c.id
    WHERE t.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Ticket no encontrado' });
    res.json(row);
  });
});

// POST crear nuevo ticket
router.post('/', (req, res) => {
  const { 
    cliente_id, 
    cotizacion_id, 
    estado, 
    prioridad, 
    descripcion_problema, 
    notas_tecnicas 
  } = req.body;

  // Generar número de ticket único TKT-XXXXXX
  const numero_ticket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const fecha = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO tickets (
      numero_ticket, cliente_id, cotizacion_id, fecha_creacion, 
      estado, prioridad, descripcion_problema, notas_tecnicas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    numero_ticket, 
    cliente_id, 
    cotizacion_id || null, 
    fecha, 
    estado || 'Pendiente', 
    prioridad || 'Media', 
    descripcion_problema, 
    notas_tecnicas || ''
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, numero_ticket });
  });
});

// PUT actualizar ticket
router.put('/:id', (req, res) => {
  const { estado, prioridad, descripcion_problema, notas_tecnicas } = req.body;
  const sql = `
    UPDATE tickets 
    SET estado = ?, prioridad = ?, descripcion_problema = ?, notas_tecnicas = ?
    WHERE id = ?
  `;
  db.run(sql, [estado, prioridad, descripcion_problema, notas_tecnicas, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// DELETE (soft delete) ticket
router.delete('/:id', (req, res) => {
  db.run('UPDATE tickets SET activo = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ archived: this.changes });
  });
});

export default router;
