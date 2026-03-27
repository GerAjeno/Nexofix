import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('clientes')
                             .where('activo', '==', 1)
                             .get();
    let rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordenar descendente en memoria
    rows.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('clientes').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen } = req.body;
  
  if (!tipo || !rut || !nombre) {
    return res.status(400).json({ error: 'tipo, rut, and nombre are required' });
  }

  try {
    const clientesRef = db.collection('clientes');
    
    // Verificar si el RUT ya existe
    const snapshot = await clientesRef.where('rut', '==', rut).limit(1).get();

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const data = existingDoc.data();
      if (data.activo === 0) {
        // Reactivar
        const updateData = { tipo, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen, activo: 1, updated_at: new Date().toISOString() };
        await clientesRef.doc(existingDoc.id).update(updateData);
        return res.status(201).json({ id: existingDoc.id, message: 'Cliente reactivado y actualizado exitosamente' });
      } else {
        return res.status(409).json({ error: 'El RUT ya existe en el sistema y está activo' });
      }
    }

    // INSERT normal
    const nuevoCliente = {
      tipo, rut, nombre, 
      representante: representante || null, 
      telefono: telefono || null,
      email: email || null, 
      direccion: direccion || null, 
      giro: giro || null,
      notas_texto: notas_texto || null, 
      notas_imagen: notas_imagen || null,
      activo: 1, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString()
    };
    
    // Limpiamos undefined para Firestore
    Object.keys(nuevoCliente).forEach(key => nuevoCliente[key] === undefined ? delete nuevoCliente[key] : {});

    const docRef = await clientesRef.add(nuevoCliente);
    res.status(201).json({ id: docRef.id, message: 'Cliente creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { tipo, rut, nombre, representante, telefono, email, direccion, giro, notas_texto, notas_imagen } = req.body;
  
  try {
    const docRef = db.collection('clientes').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (rut && rut !== doc.data().rut) {
       const exists = await db.collection('clientes').where('rut', '==', rut).limit(1).get();
       if (!exists.empty) return res.status(409).json({ error: 'El RUT ya existe en el sistema' });
    }

    const updates = {};
    if (tipo !== undefined) updates.tipo = tipo;
    if (rut !== undefined) updates.rut = rut;
    if (nombre !== undefined) updates.nombre = nombre;
    if (representante !== undefined) updates.representante = representante;
    if (telefono !== undefined) updates.telefono = telefono;
    if (email !== undefined) updates.email = email;
    if (direccion !== undefined) updates.direccion = direccion;
    if (giro !== undefined) updates.giro = giro;
    if (notas_texto !== undefined) updates.notas_texto = notas_texto;
    if (notas_imagen !== undefined) updates.notas_imagen = notas_imagen;
    updates.updated_at = new Date().toISOString();

    await docRef.update(updates);
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('clientes').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Borrado suave
    await docRef.update({ activo: 0, updated_at: new Date().toISOString() });
    res.json({ message: 'Cliente archivado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
