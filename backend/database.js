import sqlite3 from 'sqlite3';
import path from 'path';

// Definir ruta de la BD
const dbPath = path.join(process.cwd(), 'nexofix.db');

// Conectar a la base de datos SQLite
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
    // Tabla de Clientes
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
        activo INTEGER DEFAULT 1, -- 1: Active, 0: Archived/Deleted
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Cotizaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS cotizaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_cotizacion TEXT UNIQUE,
        cliente_id INTEGER,
        fecha_emision DATE,
        validez TEXT,
        proyecto TEXT,
        descripcion_trabajo TEXT,
        subtotal INTEGER,
        descuento_porcentaje INTEGER,
        descuento_monto INTEGER,
        total_final INTEGER,
        condiciones_notas TEXT,
        activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      )
    `);

    // Tabla de Ítems de la Cotización
    db.run(`
      CREATE TABLE IF NOT EXISTS cotizacion_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cotizacion_id INTEGER,
        descripcion TEXT,
        cantidad INTEGER,
        precio_unitario INTEGER,
        total INTEGER,
        FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized.');
  });
}
