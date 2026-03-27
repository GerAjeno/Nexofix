import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// GET todas las plantillas de textos
router.get('/textos', async (req, res) => {
  const { tipo } = req.query;
  try {
    let query = db.collection('plantillas').where('activo', '==', 1);
    if (tipo) {
      query = query.where('tipo', '==', tipo);
    }
    const snapshot = await query.get();
    const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST nueva plantilla de texto
router.post('/textos', async (req, res) => {
  const { tipo, nombre, contenido } = req.body;
  try {
    const docRef = await db.collection('plantillas').add({
      tipo,
      nombre,
      contenido,
      activo: 1,
      created_at: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Plantillas de Itemizados Completos ---

// POST nueva plantilla de itemizado (array embebido)
router.post('/itemizados', async (req, res) => {
  const { nombre, items } = req.body;
  try {
    const docRef = await db.collection('plantillas_itemizados').add({
      nombre,
      items: items || [],
      activo: 1,
      created_at: new Date().toISOString()
    });
    res.json({ id: docRef.id, message: 'Plantilla de itemizado guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET todas las plantillas de itemizados
router.get('/itemizados', async (req, res) => {
  try {
    const snapshot = await db.collection('plantillas_itemizados').where('activo', '==', 1).get();
    const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET detalles de una plantilla de itemizado (Extrae items del documento)
router.get('/itemizados/:id', async (req, res) => {
  try {
    const doc = await db.collection('plantillas_itemizados').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(doc.data().items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
