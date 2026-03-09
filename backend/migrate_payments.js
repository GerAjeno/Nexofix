import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("=== ACTUALIZACIÓN DE ESQUEMA: COBRANZAS ===");

db.serialize(() => {
  db.run("ALTER TABLE cobranzas ADD COLUMN fecha_pago TEXT", (err) => {
    if (err) console.log("Nota: fecha_pago ya existe o error menor.");
    else console.log("Columna 'fecha_pago' añadida.");
  });

  db.run("ALTER TABLE cobranzas ADD COLUMN metodo_pago TEXT", (err) => {
    if (err) console.log("Nota: metodo_pago ya existe o error menor.");
    else console.log("Columna 'metodo_pago' añadida.");
  });

  db.run("ALTER TABLE cobranzas ADD COLUMN notas_pago TEXT", (err) => {
    if (err) console.log("Nota: notas_pago ya existe o error menor.");
    else console.log("Columna 'notas_pago' añadida.");
  });

  console.log("Migración finalizada.");
  db.close();
});
