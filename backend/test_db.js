import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("--- Diagnóstico de Tickets Terminados ---");
db.all("SELECT id, numero_ticket, estado, fecha_termino, cotizacion_id FROM tickets WHERE estado = 'Terminado' LIMIT 5", [], (err, rows) => {
  if (err) console.error(err);
  console.log("Tickets con estado 'Terminado':", rows);
  
  console.log("\n--- Diagnóstico de Cobranzas ---");
  db.all("SELECT * FROM cobranzas LIMIT 5", [], (errC, rowsC) => {
    if (errC) console.error(errC);
    console.log("Registros en tabla cobranzas:", rowsC);
    db.close();
  });
});
