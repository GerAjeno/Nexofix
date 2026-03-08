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
        tipo_impuesto TEXT, -- 'Factura', 'Boleta', 'Sin Impuesto'
        monto_impuesto INTEGER,
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

    // Tabla de Plantillas de Textos (Descripciones, Condiciones)
    db.run(`
      CREATE TABLE IF NOT EXISTS plantillas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT, -- 'descripcion' o 'condiciones'
        nombre TEXT,
        contenido TEXT,
        activo INTEGER DEFAULT 1
      )
    `);

    // Tabla de Tickets / Trabajos
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ticket TEXT UNIQUE,
        cliente_id INTEGER,
        cotizacion_id INTEGER,
        fecha_creacion TEXT DEFAULT (DATE('now')),
        estado TEXT DEFAULT 'Pendiente', -- 'Pendiente', 'En Proceso', 'Terminado', 'Cancelado'
        prioridad TEXT DEFAULT 'Media', -- 'Baja', 'Media', 'Alta'
        descripcion_problema TEXT,
        notas_tecnicas TEXT,
        activo INTEGER DEFAULT 1,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id),
        FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id)
      )
    `);
    
    // Tablas para Plantillas de Itemizados Completos
    db.run(`
      CREATE TABLE IF NOT EXISTS plantillas_itemizados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        activo INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS plantillas_itemizados_detalles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plantilla_id INTEGER,
        descripcion TEXT,
        cantidad REAL,
        precio_unitario INTEGER,
        FOREIGN KEY (plantilla_id) REFERENCES plantillas_itemizados (id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized.');
  });
}
