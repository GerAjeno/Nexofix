import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todas las plantillas por tipo
router.get('/textos', (req, res) => {
  const { tipo } = req.query;
  let sql = 'SELECT * FROM plantillas WHERE activo = 1';
  let params = [];
  
  if (tipo) {
    sql += ' AND tipo = ?';
    params.push(tipo);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST nueva plantilla de texto
router.post('/textos', (req, res) => {
  const { tipo, nombre, contenido } = req.body;
  const sql = 'INSERT INTO plantillas (tipo, nombre, contenido) VALUES (?, ?, ?)';
  db.run(sql, [tipo, nombre, contenido], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// GET catálogo de ítems
router.get('/items', (req, res) => {
  db.all('SELECT * FROM catalogo_items WHERE activo = 1', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST nuevo ítem al catálogo
router.post('/items', (req, res) => {
  const { nombre, precio_unitario } = req.body;
  const sql = 'INSERT INTO catalogo_items (nombre, precio_unitario) VALUES (?, ?)';
  db.run(sql, [nombre, precio_unitario], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// --- Plantillas de Itemizados Completos ---

// POST nueva plantilla de itemizado (con sus detalles)
router.post('/itemizados', (req, res) => {
  const { nombre, items } = req.body;
  
  db.run('INSERT INTO plantillas_itemizados (nombre) VALUES (?)', [nombre], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const plantillaId = this.lastID;
    const stmt = db.prepare('INSERT INTO plantillas_itemizados_detalles (plantilla_id, descripcion, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');
    
    items.forEach(item => {
      stmt.run(plantillaId, item.descripcion, item.cantidad, item.precio_unitario);
    });
    
    stmt.finalize();
    res.json({ id: plantillaId, message: 'Plantilla de itemizado guardada' });
  });
});

// GET todas las plantillas de itemizados
router.get('/itemizados', (req, res) => {
  db.all('SELECT * FROM plantillas_itemizados WHERE activo = 1', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET detalles de una plantilla de itemizado
router.get('/itemizados/:id', (req, res) => {
  db.all('SELECT * FROM plantillas_itemizados_detalles WHERE plantilla_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

export default router;
