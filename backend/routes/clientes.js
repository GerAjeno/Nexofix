import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todos los clientes activos
router.get('/', (req, res) => {
  db.all('SELECT * FROM clientes WHERE activo = 1 ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET un solo cliente
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM clientes WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(row);
  });
});

// POST nuevo cliente
router.post('/', (req, res) => {
  const { tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen } = req.body;
  
  // Validación básica
  if (!tipo || !rut || !nombre) {
    return res.status(400).json({ error: 'tipo, rut, and nombre are required' });
  }

  // Verificar si el RUT ya existe
  db.get('SELECT id, activo FROM clientes WHERE rut = ?', [rut], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      if (row.activo === 0) {
        // Reactivar y actualizar en lugar de fallar por restricción única
        const updateSql = `
          UPDATE clientes 
          SET tipo=?, nombre=?, representante=?, telefono=?, email=?, direccion=?, giro=?, notas_texto=?, notas_imagen=?, activo=1, updated_at=CURRENT_TIMESTAMP 
          WHERE id=?
        `;
        const updateParams = [tipo, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen, row.id];
        
        db.run(updateSql, updateParams, function(err) {
          if (err) return res.status(500).json({ error: err.message });
          return res.status(201).json({ id: row.id, message: 'Cliente reactivado y actualizado exitosamente' });
        });
        return;
      } else {
        return res.status(409).json({ error: 'El RUT ya existe en el sistema y está activo' });
      }
    }

    // INSERT normal
    const sql = `
      INSERT INTO clientes (tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const params = [tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen];

    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Cliente creado exitosamente' });
    });
  });
});

// PUT actualizar cliente
router.put('/:id', (req, res) => {
  const { tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen } = req.body;
  
  const sql = `
    UPDATE clientes 
    SET tipo = COALESCE(?, tipo),
        rut = COALESCE(?, rut),
        nombre = COALESCE(?, nombre),
        representante = COALESCE(?, representante),
        telefono = COALESCE(?, telefono),
        email = COALESCE(?, email),
        direccion = COALESCE(?, direccion),
        giro = COALESCE(?, giro),
        notas_texto = COALESCE(?, notas_texto),
        notas_imagen = COALESCE(?, notas_imagen),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'El RUT ya existe en el sistema' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado exitosamente' });
  });
});

// DELETE (Borrado Suave / Archivar) cliente
router.delete('/:id', (req, res) => {
  db.run('UPDATE clientes SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente archivado exitosamente' });
  });
});

export default router;
