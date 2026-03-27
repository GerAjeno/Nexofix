import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
};

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios')
                           .orderBy('created_at', 'desc')
                           .get();
    const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter out password_hash
    const safeRows = rows.map(r => {
      const { password_hash, ...rest } = r;
      return rest;
    });
    res.json(safeRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { username, password, rol } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });

  try {
    const usuariosRef = db.collection('usuarios');
    const exists = await usuariosRef.where('username', '==', username).get();
    if (!exists.empty) return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const roleToAssign = rol === 'admin' ? 'admin' : 'tecnico';

    const newUser = {
      username,
      password_hash: hash,
      rol: roleToAssign,
      activo: 1,
      created_at: new Date().toISOString()
    };

    const docRef = await usuariosRef.add(newUser);
    res.status(201).json({ id: docRef.id, username, rol: roleToAssign, activo: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { password, rol, activo, username } = req.body;

  try {
    const userRef = db.collection('usuarios').doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (username && username !== userDoc.data().username) {
       const exists = await db.collection('usuarios').where('username', '==', username).get();
       if (!exists.empty) return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (rol !== undefined) updates.rol = rol;
    if (activo !== undefined) updates.activo = activo;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(password, salt);
    }

    await userRef.update(updates);
    res.json({ message: 'Usuario modificado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const userRef = db.collection('usuarios').doc(id);
    await userRef.delete();
    // Alternativa borrar logicamente: await userRef.update({ activo: 0 });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
