import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexofix_prod_secret_2026_default';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef
      .where('username', '==', username)
      .where('activo', '==', 1)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const userDoc = snapshot.docs[0];
    const authUser = { id: userDoc.id, ...userDoc.data() };

    const isValidPassword = await bcrypt.compare(password, authUser.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: authUser.id,
      username: authUser.username,
      rol: authUser.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: {
        username: authUser.username,
        rol: authUser.rol
      }
    });

  } catch (error) {
    console.error("Error crítico en login (Firebase):", error);
    return res.status(500).json({ error: 'Error interno del servidor. Intente más tarde.' });
  }
});

export default router;
