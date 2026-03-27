import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

let db = null;
let adminApp;

try {
  // Buscamos el archivo de credenciales de Firebase en el entorno local (backend/)
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✅ Conectado a Firebase Firestore (Vía serviceAccountKey.json).');
  } else if (process.env.FIREBASE_CONFIG) {
    // Soporte para entornos de producción (variables de entorno)
    adminApp = initializeApp();
    console.log('✅ Conectado a Firebase Firestore (Vía variables de entorno).');
  } else {
    // Si no existe, tiramos advertencia pero no crasheamos por si queremos añadir credenciales en caliente o estamos modo dev
    console.error('❌ ADVERTENCIA CRÍTICA: Archivo serviceAccountKey.json no encontrado.');
    console.error('❌ Descarga la clave desde la Consola de Firebase > Configuración del Proyecto > Cuentas de Servicio y colócala en /backend/serviceAccountKey.json');
  }

  if (adminApp) {
    db = getFirestore(adminApp);
    // Configurar preferencias de firestore si son necesarias (ignoreUndefinedProperties ayuda mucho en migraciones)
    db.settings({ ignoreUndefinedProperties: true });
  }

} catch (error) {
  console.error('Error al inicializar Firebase Admin:', error.message);
}

export { db };
