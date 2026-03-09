import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET /api/ajustes/general
router.get('/general', (req, res) => {
  db.get("SELECT * FROM ajustes_general WHERE id = 1", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    // Retornamos un objeto vacío de contingencia por si la migración no ocurriese
    res.json(row || {}); 
  });
});

// PUT /api/ajustes/general
router.put('/general', (req, res) => {
  const {
    empresa_nombre,
    empresa_logo,
    empresa_direccion,
    empresa_telefono,
    banco_rut,
    banco_nombre_titular,
    banco_email,
    banco_nombre,
    banco_tipo_cuenta,
    banco_numero_cuenta,
    idioma,
    impuesto_boleta,
    impuesto_iva
  } = req.body;

  const sql = `
    UPDATE ajustes_general 
    SET 
        empresa_nombre = ?, empresa_logo = ?, empresa_direccion = ?, empresa_telefono = ?,
        banco_rut = ?, banco_nombre_titular = ?, banco_email = ?, banco_nombre = ?,
        banco_tipo_cuenta = ?, banco_numero_cuenta = ?, idioma = ?,
        impuesto_boleta = ?, impuesto_iva = ?
    WHERE id = 1
  `;

  db.run(sql, [
    empresa_nombre, empresa_logo, empresa_direccion, empresa_telefono,
    banco_rut, banco_nombre_titular, banco_email, banco_nombre,
    banco_tipo_cuenta, banco_numero_cuenta, idioma,
    impuesto_boleta, impuesto_iva
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes, message: 'Ajustes guardados exitosamente' });
  });
});

export default router;
