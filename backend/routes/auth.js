import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';

const router = express.Router();

// Llave secreta para firmar los JWT (en un entorno cloud, esto debería ser una variable de entorno segura)
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
      rol: authUser.rol,
      requiere_reset: authUser.requiere_reset
    };

    // El token expira en 8 horas (jornada laboral típica)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: {
        username: authUser.username,
        rol: authUser.rol,
        requiere_reset: authUser.requiere_reset
      }
    });
  });
});

// POST /api/auth/first-setup - Para cambios obligatorios en primer inicio
router.post('/first-setup', verifyToken, async (req, res) => {
  const { newUsername, newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword) {
    return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // El cambio de nombre de usuario es opcional
    const username = newUsername ? newUsername.trim().toLowerCase() : req.user.username;

    db.run(
      "UPDATE usuarios SET username = ?, password_hash = ?, requiere_reset = 0 WHERE id = ?",
      [username, hash, userId],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Credenciales actualizadas correctamente. Por favor, re-inicia sesión.' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error procesando la actualización' });
  }
});

// Middleware opcional (se puede exportar para ser usado en otras rutas en el futuro)
export const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }
};

export default router;
