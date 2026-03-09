import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error abriendo BD:', err.message);
  }
});

console.log("=== SETUP DE BASE DE DATOS: AJUSTES GENERALES ===");

const createTableSql = `
  CREATE TABLE IF NOT EXISTS ajustes_general (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    empresa_nombre TEXT DEFAULT 'NexoFix',
    empresa_logo TEXT DEFAULT '/logo.png',
    empresa_direccion TEXT,
    empresa_telefono TEXT,
    banco_rut TEXT,
    banco_nombre_titular TEXT,
    banco_email TEXT,
    banco_nombre TEXT,
    banco_tipo_cuenta TEXT,
    banco_numero_cuenta TEXT,
    idioma TEXT DEFAULT 'Español Latino',
    impuesto_boleta REAL DEFAULT 15.25,
    impuesto_iva REAL DEFAULT 19.00,
    smtp_host TEXT,
    smtp_puerto INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT
  )
`;

db.serialize(() => {
  db.run(createTableSql, (err) => {
    if (err) {
      console.error("Error creando tabla ajustes_general:", err);
    } else {
      console.log("Tabla 'ajustes_general' verificada/creada.");
      
      // Inyectar fila por defecto si no existe (id=1 garantiza que solo haya una fila de configuración)
      db.get(`SELECT id FROM ajustes_general WHERE id = 1`, (err, row) => {
        if (!row) {
          db.run(`INSERT INTO ajustes_general (id) VALUES (1)`, (err) => {
             if (err) console.error("Error insertando variables por defecto:", err);
             else console.log("Valores iniciales de Ajustes insertados correctamente.");
             db.close();
          });
        } else {
          console.log("Valores de Ajustes ya existen en el sistema.");
        }
        
        // Migraciones de nuevas columnas SMTP para BD existente
        db.run('ALTER TABLE ajustes_general ADD COLUMN smtp_host TEXT', () => {});
        db.run('ALTER TABLE ajustes_general ADD COLUMN smtp_puerto INTEGER', () => {});
        db.run('ALTER TABLE ajustes_general ADD COLUMN smtp_user TEXT', () => {});
        db.run('ALTER TABLE ajustes_general ADD COLUMN smtp_pass TEXT', () => {
          console.log("Columnas SMTP verificadas.");
          db.close();
        });
      });
    }
  });
});
