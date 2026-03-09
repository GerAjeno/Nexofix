import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("=== REPARACIÓN DE FLUJO DE COBRANZA ===");

db.serialize(() => {
  // 1. Encontrar tickets terminados sin cobranza
  const sql = `
    SELECT t.id, t.numero_ticket, t.cliente_id, t.cotizacion_id, cot.total_final 
    FROM tickets t
    LEFT JOIN cobranzas cob ON t.id = cob.ticket_id
    LEFT JOIN cotizaciones cot ON t.cotizacion_id = cot.id
    WHERE t.estado = 'Terminado' AND cob.id IS NULL AND t.activo = 1
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error buscando huérfanos:", err);
      return;
    }

    if (rows.length === 0) {
      console.log("No se encontraron tickets huérfanos. (Sincronización OK)");
      db.close();
      return;
    }

    console.log(`Se encontraron ${rows.length} tickets sin cobranza. Iniciando reparación...`);

    rows.forEach(row => {
      const numero_cobro = `COB-${Math.floor(100000 + Math.random() * 900000)}`;
      const monto = row.total_final || 0;
      
      const insSql = `
        INSERT INTO cobranzas (numero_cobro, ticket_id, cliente_id, cotizacion_id, monto_total)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(insSql, [numero_cobro, row.id, row.cliente_id, row.cotizacion_id, monto], (errIns) => {
        if (errIns) console.error(`Fallo reparando ticket ${row.numero_ticket}:`, errIns.message);
        else console.log(`REPARADO: Ticket ${row.numero_ticket} -> Cobro ${numero_cobro} ($${monto})`);
      });
    });

    console.log("Proceso de reparación finalizado.");
  });
});
