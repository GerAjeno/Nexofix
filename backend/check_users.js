import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, username, rol, activo FROM usuarios", (err, rows) => {
        if (err) {
            console.error("Error al consultar usuarios:", err);
        } else {
            console.log("=== USUARIOS EN LA BASE DE DATOS ===");
            console.table(rows);
        }
        db.close();
    });
});
