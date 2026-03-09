import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("=== REPORTE DE SALUD COMERCIAL NEXOFIX ===");

db.serialize(() => {
  console.log("\n1. TICKETS TERMINADOS:");
  db.all("SELECT id, numero_ticket, cliente_id, cotizacion_id, estado, fecha_termino FROM tickets WHERE estado = 'Terminado'", [], (err, rows) => {
    if (err) console.error(err);
    console.table(rows || []);

    console.log("\n2. COBRANZAS REGISTRADAS:");
    db.all("SELECT id, numero_cobro, ticket_id, cliente_id, cotizacion_id, monto_total, estado FROM cobranzas", [], (errC, rowsC) => {
      if (errC) console.error(errC);
      console.table(rowsC || []);

      console.log("\n3. RESUMEN DE DISCREPANCIAS:");
      const ticketIds = (rows || []).map(r => r.id);
      const cobranzaTicketIds = (rowsC || []).map(r => r.ticket_id);
      
      const missing = ticketIds.filter(id => !cobranzaTicketIds.includes(id));
      
      if (missing.length > 0) {
        console.log("ALERTA: Se encontraron", missing.length, "tickets terminados SIN cobranza.");
        console.log("IDs de tickets huérfanos:", missing);
      } else {
        console.log("TODOS los tickets terminados tienen su respectivo cobro. (OK)");
      }

      console.log("\n4. VERIFICACIÓN DE COTIZACIONES:");
      db.all("SELECT id, numero_cotizacion, total_final FROM cotizaciones LIMIT 5", [], (errCot, rowsCot) => {
        console.table(rowsCot || []);
        db.close();
      });
    });
  });
});
