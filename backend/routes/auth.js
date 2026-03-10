import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';

const router = express.Router();

const JWT_SECRET = 'nexofix_super_secret_key_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  // Buscar usuario en SQLite
  db.get("SELECT * FROM usuarios WHERE username = ? AND activo = 1", [username], async (err, authUser) => {
    if (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!authUser) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); // Evitar decir "usuario no existe" por seguridad
    }

    // Verificar contraseña encriptada
    const isValidPassword = await bcrypt.compare(password, authUser.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JSON Web Token
    const payload = {
      id: authUser.id,
      username: authUser.username,
      rol: authUser.rol
    };

    // El token expira en 8 horas (jornada laboral típica)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: {
        username: authUser.username,
        rol: authUser.rol
      }
    });
  });
});

export default router;
