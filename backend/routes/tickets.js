import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todos los tickets activos
router.get('/', (req, res) => {
  const sql = `
    SELECT t.*, c.nombre as cliente_nombre, cot.proyecto as proyecto_nombre
    FROM tickets t
    JOIN clientes c ON t.cliente_id = c.id
    LEFT JOIN cotizaciones cot ON t.cotizacion_id = cot.id
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
    SELECT t.*, c.nombre as cliente_nombre, c.rut as cliente_rut, c.telefono as cliente_telefono, c.direccion as cliente_direccion,
           cot.proyecto as proyecto_nombre, cot.numero_cotizacion as numero_cotizacion, t.tipo_trabajo
    FROM tickets t
    JOIN clientes c ON t.cliente_id = c.id
    LEFT JOIN cotizaciones cot ON t.cotizacion_id = cot.id
    WHERE t.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Ticket no encontrado' });

    // Si tiene cotización, traer ítems y notas
    if (row.cotizacion_id) {
      const sqlItems = `SELECT descripcion, cantidad FROM cotizacion_items WHERE cotizacion_id = ?`;
      const sqlCotInfo = `SELECT condiciones_notas, descripcion_trabajo FROM cotizaciones WHERE id = ?`;

      db.all(sqlItems, [row.cotizacion_id], (errItems, items) => {
        db.get(sqlCotInfo, [row.cotizacion_id], (errCot, cotInfo) => {
          res.json({
            ...row,
            items: items || [],
            condiciones_notas: cotInfo ? cotInfo.condiciones_notas : '',
            descripcion_cotizada: cotInfo ? cotInfo.descripcion_trabajo : ''
          });
        });
      });
    } else {
      res.json({ ...row, items: [], condiciones_notas: '', descripcion_cotizada: '' });
    }
  });
});

// POST crear nuevo ticket
router.post('/', (req, res) => {
  const { 
    estado, 
    prioridad, 
    descripcion_problema, 
    notas_tecnicas,
    jornada,
    fecha_agendada
  } = req.body;

  // Lógica: Si se asigna jornada, pasar a En Proceso automáticamente
  let estadoFinal = estado || 'Pendiente';
  if ((jornada === 'Mañana' || jornada === 'Tarde') && estadoFinal === 'Pendiente') {
    estadoFinal = 'En Proceso';
  }

  // Generar número de ticket único TKT-XXXXXX
  const numero_ticket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const fecha = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO tickets (
      numero_ticket, cliente_id, cotizacion_id, direccion_trabajo, telefono_contacto, tipo_trabajo,
      fecha_creacion, estado, prioridad, descripcion_problema, notas_tecnicas,
      jornada, fecha_agendada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    numero_ticket, 
    cliente_id, 
    cotizacion_id || null, 
    direccion_trabajo,
    telefono_contacto,
    tipo_trabajo,
    fecha, 
    estadoFinal, 
    prioridad || 'Media', 
    descripcion_problema, 
    notas_tecnicas || '',
    jornada || 'Sin Asignar',
    fecha_agendada || null
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, numero_ticket });
  });
});

// PUT actualizar ticket
router.put('/:id', (req, res) => {
  const { 
    estado, prioridad, descripcion_problema, notas_tecnicas, 
    direccion_trabajo, telefono_contacto, tipo_trabajo,
    jornada, fecha_agendada
  } = req.body;

  // Lógica de agendamiento automático
  let nuevoEstado = estado;
  if ((jornada === 'Mañana' || jornada === 'Tarde') && estado === 'Pendiente') {
    nuevoEstado = 'En Proceso';
  }

  const sql = `
    UPDATE tickets 
    SET estado = ?, prioridad = ?, descripcion_problema = ?, notas_tecnicas = ?, 
        direccion_trabajo = ?, telefono_contacto = ?, tipo_trabajo = ?,
        jornada = ?, fecha_agendada = ?
    WHERE id = ?
  `;
  db.run(sql, [
    nuevoEstado, prioridad, descripcion_problema, notas_tecnicas, 
    direccion_trabajo, telefono_contacto, tipo_trabajo,
    jornada, fecha_agendada,
    req.params.id
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes, nuevoEstado });
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
