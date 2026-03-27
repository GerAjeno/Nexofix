import express from 'express';
import { db } from '../database.js';

const router = express.Router();

const DOC_ID = 'general';

// GET /api/ajustes/general
router.get('/general', async (req, res) => {
  try {
    const doc = await db.collection('configuracion').doc(DOC_ID).get();
    if (!doc.exists) return res.json({});
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/ajustes/general
router.put('/general', async (req, res) => {
  const data = req.body;
  try {
    // Almacenamos el documento 'general' en la colección 'configuracion'
    const docRef = db.collection('configuracion').doc(DOC_ID);
    
    // Convertir undefined a null para evitar Firebase errors
    const sanitizedData = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        sanitizedData[key] = data[key];
      }
    }

    await docRef.set(sanitizedData, { merge: true });
    res.json({ updated: 1, message: 'Ajustes guardados exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
