import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, storageBucket } from './database.js';
import clientesRoutes from './routes/clientes.js';
import cotizacionesRoutes from './routes/cotizaciones.js';
import plantillasRoutes from './routes/plantillas.js';
import ticketRoutes from './routes/tickets.js';
import cobranzaRoutes from './routes/cobranzas.js';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import ajustesRoutes from './routes/ajustes.js';
import emailRoutes from './routes/email.js';
import usuariosRoutes from './routes/usuarios.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const allowedOrigins = ['https://ger-cloud.cc', 'https://nexofix.ger-cloud.cc', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El policy de CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

// Usar memoria RAM para interceptar el archivo en caliente antes de pasarlo a Firebase
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas de API
app.use('/api/clientes', clientesRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/plantillas', plantillasRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/cobranzas', cobranzaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ajustes', ajustesRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Endpoint de subida de archivos reescrito para Firebase Storage
app.post('/api/upload', upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  
  if (!storageBucket) {
    return res.status(500).json({ error: 'Firebase Storage no está inicializado en este proyecto.' });
  }

  try {
    const safeFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `uploads/${Date.now()}-${safeFilename}`;
    const fileRef = storageBucket.file(filename);
    
    // Subir el buffer de memoria a la Nube de Google
    await fileRef.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Generamos un enlace de lectura firmado válido hasta el siglo XXV
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    res.status(200).json({
      message: 'Imagen subida exitosamente a Firebase Storage',
      filename: filename,
      path: signedUrl
    });
  } catch (error) {
    console.error('Error subiendo imagen a Firebase Storage:', error);
    res.status(500).json({ error: 'Fallo al procesar archivo en la nube.' });
  }
});

// Servir archivos estáticos desde el directorio 'uploads'
app.use('/uploads', express.static(uploadDir));

// Servir el frontend de React compilado de forma nativa desde el mismo puerto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Ruta básica de salud y comprobación de estado de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'La API de NexoFix está en funcionamiento' });
});

app.listen(PORT, () => {
  console.log(`Servidor de NexoFix (Frontend + API) ejecutándose en http://localhost:${PORT}`);
});
