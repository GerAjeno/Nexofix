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
        tipo_trabajo TEXT,
        estado TEXT DEFAULT 'Enviada', -- Enviada, En Proceso, Aceptada, Rechazada
        proyecto TEXT,
        direccion_trabajo TEXT,
        telefono_contacto TEXT,
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
        direccion_trabajo TEXT,
        telefono_contacto TEXT,
        tipo_trabajo TEXT,
        jornada TEXT DEFAULT 'Sin Asignar',
        fecha_agendada TEXT,
        fecha_creacion TEXT DEFAULT (DATE('now')),
        estado TEXT DEFAULT 'Pendiente', -- 'Pendiente', 'En Proceso', 'Terminado', 'Cancelado'
        prioridad TEXT DEFAULT 'Media', -- 'Baja', 'Media', 'Alta'
        descripcion_problema TEXT,
        notas_tecnicas TEXT,
        fecha_termino TEXT,
        activo INTEGER DEFAULT 1,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id),
        FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id)
      )
    `, (err) => {
      if (!err) {
        // Migración: Añadir columnas si no existen
        db.run("ALTER TABLE tickets ADD COLUMN jornada TEXT DEFAULT 'Sin Asignar'", () => { });
        db.run("ALTER TABLE tickets ADD COLUMN fecha_agendada TEXT", () => { });
        db.run("ALTER TABLE tickets ADD COLUMN fecha_termino TEXT", () => { });
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS cobranzas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_cobro TEXT UNIQUE,
        ticket_id INTEGER,
        cliente_id INTEGER,
        cotizacion_id INTEGER,
        fecha_creacion TEXT DEFAULT (DATE('now')),
        estado TEXT DEFAULT 'En Cobro', -- 'En Cobro', 'Cobrado', 'Rechazado'
        monto_total INTEGER DEFAULT 0,
        activo INTEGER DEFAULT 1,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id)
      )
    `);

    // Migration: ensure requiere_reset column exists
    db.run("ALTER TABLE usuarios ADD COLUMN requiere_reset INTEGER DEFAULT 0", () => { });

    console.log('Database tables initialized.');
  });
}
