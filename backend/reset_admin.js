import { db } from './database.js';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
  console.log('Iniciando reseteo de administrador en Firebase...');
  
  if (!db) {
    console.error('Error: Base de datos no inicializada. Revisa el archivo serviceAccountKey.json.');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123321', salt);

    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('username', '==', 'admin').get();

    if (!snapshot.empty) {
      // Si el usuario existe, actualizamos su clave y nos aseguramos de que es admin
      const docId = snapshot.docs[0].id;
      await usuariosRef.doc(docId).update({
        password_hash: hash,
        activo: 1,
        rol: 'admin'
      });
      console.log('✅ Contraseña reseteada con éxito. Usuario: admin | Contraseña: 123321');
    } else {
      // Si no existe, lo creamos desde cero
      await usuariosRef.add({
        username: 'admin',
        password_hash: hash,
        rol: 'admin',
        activo: 1,
        created_at: new Date().toISOString()
      });
      console.log('✅ Adminsitrador creado desde cero. Usuario: admin | Contraseña: 123321');
    }
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al intentar modificar el usuario en Firebase:', error.message);
    process.exit(1);
  }
}

resetAdmin();
