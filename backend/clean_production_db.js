import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo la base de datos:', err.message);
        process.exit(1);
    }
});

console.log("=== REINICIO DE BASE DE DATOS NEXOFIX: BORRADO DE DATOS OPERATIVOS ===");
console.log("Advertencia: Esta acción eliminará Clientes, Cotizaciones, Tickets y Cobranzas.");

const tablesToClear = [
    'cobranzas',
    'tickets',
    'cotizacion_items',
    'cotizaciones',
    'clientes',
    'plantillas'
];

db.serialize(() => {
    // Desactivar temporalmente las claves foráneas para permitir el borrado sin conflictos de orden
    db.run("PRAGMA foreign_keys = OFF");

    tablesToClear.forEach((table) => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err) {
                console.error(`Error limpiando tabla ${table}:`, err.message);
            } else {
                console.log(`[OK] Tabla '${table}' vaciada.`);
            }
        });

        // Resetear el contador de IDs autoincrementales
        db.run(`UPDATE sqlite_sequence SET seq = 0 WHERE name = '${table}'`, (err) => {
            if (err) {
                // Ignorar error si la tabla no tiene autoincrement (sqlite_sequence podría no tener la entrada)
            }
        });
    });

    db.run("PRAGMA foreign_keys = ON", (err) => {
        if (!err) {
            console.log("\n✅ Base de datos reseteada con éxito.");
            console.log("ℹ️ Las tablas 'usuarios' y 'ajustes_general' se mantuvieron intactas.");
            db.close();
        }
    });
});
