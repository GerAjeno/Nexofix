import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar que el usuario que hace la petición es administrador
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
};

// GET /api/usuarios - Listar todos los usuarios
router.get('/', verifyToken, verifyAdmin, (req, res) => {
  db.all("SELECT id, username, rol, activo, created_at FROM usuarios ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/usuarios - Crear un nuevo usuario (tecnico o admin)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { username, password, rol } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const roleToAssign = rol === 'admin' ? 'admin' : 'tecnico'; // Por defecto técnico u obliga a elegir

    db.run(
      "INSERT INTO usuarios (username, password_hash, rol, activo) VALUES (?, ?, ?, 1)",
      [username, hash, roleToAssign],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username, rol: roleToAssign, activo: 1 });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error procesando la creación de usuario' });
  }
});

// PUT /api/usuarios/:id - Cambiar estado (activo/inactivo), rol o contraseña
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { password, rol, activo, username } = req.body;

  try {
    if (password) {
      // Si enviaron contraseña, actualizamos todo (incluida contraseña)
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const sql = "UPDATE usuarios SET username = COALESCE(?, username), password_hash = ?, rol = COALESCE(?, rol), activo = COALESCE(?, activo) WHERE id = ?";
      db.run(sql, [username, hash, rol, activo, id], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuario y credenciales actualizados' });
      });
    } else {
      // Solo actualizar username, rol o estado
      const sql = "UPDATE usuarios SET username = COALESCE(?, username), rol = COALESCE(?, rol), activo = COALESCE(?, activo) WHERE id = ?";
      db.run(sql, [username, rol, activo, id], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuario actualizado' });
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM usuarios WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuario eliminado', changes: this.changes });
  });
});

export default router;
