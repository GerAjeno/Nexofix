import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'nexofix.db');
const db = new sqlite3.Database(dbPath);

console.log("=== RESCATE DE CUENTA ADMINISTRADOR ===");

db.serialize(async () => {
    // 1. Listar usuarios actuales
    db.all("SELECT id, username, rol, activo FROM usuarios", async (err, rows) => {
        if (err) {
            console.error("Error consultando la base de datos:", err);
            db.close();
            return;
        }

        console.log("\nUsuarios actuales en el sistema:");
        console.table(rows);

        // 2. Resetear contraseña de 'admin' o crear uno si no hay nadie
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123321', salt);

        // Intentar actualizar el password de 'admin' si existe
        db.run("UPDATE usuarios SET password_hash = ?, activo = 1 WHERE username = 'admin'", [hash], function (err) {
            if (err) {
                console.error("Error al resetear admin:", err);
            } else if (this.changes > 0) {
                console.log("\n✅ ÉXITO: La contraseña del usuario 'admin' ha sido reseteada a: 123321");
            } else {
                console.log("\n⚠️ El usuario 'admin' no existe. Creándolo ahora...");
                db.run("INSERT INTO usuarios (username, password_hash, rol, activo) VALUES ('admin', ?, 'admin', 1)", [hash], (err) => {
                    if (err) console.error("Error al crear admin:", err);
                    else console.log("✅ ÉXITO: Usuario 'admin' creado con contraseña: 123321");
                });
            }

            console.log("\nIntenta logearte ahora con:");
            console.log("Usuario: admin");
            console.log("Password: 123321");
            db.close();
        });
    });
});
