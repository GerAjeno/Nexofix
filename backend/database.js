import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

let db = null;
let storageBucket = null;
let adminApp;

try {
  // Buscamos el archivo de credenciales de Firebase en el entorno local (backend/)
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`;
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: bucketName
    });
    console.log(`✅ Conectado a Firebase Firestore y Storage (${bucketName}).`);
  } else if (process.env.FIREBASE_CONFIG) {
    // Soporte para entornos de producción (variables de entorno)
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    adminApp = initializeApp(bucketName ? { storageBucket: bucketName } : undefined);
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
    
    try {
      storageBucket = getStorage(adminApp).bucket();
    } catch (e) {
      console.error('⚠️ Advertencia: Error inicializando Firebase Storage, puede que no esté activado en la consola plana de Firebase.', e.message);
    }
  }

} catch (error) {
  console.error('Error al inicializar Firebase Admin:', error.message);
}

export { db, storageBucket };
