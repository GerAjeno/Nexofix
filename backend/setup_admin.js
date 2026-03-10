import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("=== SETUP DE SEGURIDAD: USUARIOS ===");

db.serialize(async () => {
  // 1. Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      rol TEXT DEFAULT 'admin',
      activo INTEGER DEFAULT 1,
      requiere_reset INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("Error creando tabla usuarios:", err);
    else console.log("Tabla 'usuarios' verificada/creada.");
  });

  // 2. Insertar usuario admin por defecto si no existe
  db.get("SELECT * FROM usuarios WHERE username = 'admin'", async (err, row) => {
    if (err) {
      console.error("Error consultando admin:", err);
      db.close();
      return;
    }

    if (!row) {
      console.log("Usuario 'admin' no encontrado. Procediendo a inyectar...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('123456', salt);

      db.run("INSERT INTO usuarios (username, password_hash, requiere_reset) VALUES (?, ?, 1)", ['admin', hash], (err) => {
        if (err) console.error("Error insertando admin:", err);
        else console.log("✅ Usuario 'admin' inyectado correctamente (Clave: 123456, requiere reset).");
        db.close();
      });
    } else {
      console.log("ℹ️ Usuario 'admin' ya existe. Forzando clave '123456' y flag de reset por seguridad...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('123456', salt);

      db.run("UPDATE usuarios SET password_hash = ?, requiere_reset = 1 WHERE username = 'admin'", [hash], (err) => {
        if (err) console.error("Error actualizando admin:", err);
        else console.log("✅ Usuario 'admin' actualizado (Clave: 123456, requiere reset).");
        db.close();
      });
    }
  });
});
