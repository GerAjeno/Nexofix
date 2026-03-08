import sqlite3 from 'sqlite3';
import path from 'path';

// Define DB path
const dbPath = path.join(process.cwd(), 'nexofix.db');

// Connect to SQLite database
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Clientes table
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL, -- Final Client, Condominium, Company
        rut TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        representante TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        giro TEXT,
        notas_texto TEXT,
        notas_imagen TEXT, -- Path to uploaded image
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add other tables here (Cotizaciones, Trabajos, etc.) later
    
    console.log('Database tables initialized.');
  });
}
