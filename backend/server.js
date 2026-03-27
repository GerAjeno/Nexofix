import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './database.js';
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

// Configurar el directorio para subida de archivos
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
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

// Endpoint de subida de archivos para notas especiales o imágenes
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  // Retornar la ruta relativa al servidor para que el frontend pueda registrarla
  res.status(200).json({
    message: 'Imagen subida exitosamente',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Servir archivos estáticos desde el directorio 'uploads'
app.use('/uploads', express.static(uploadDir));

// Servir el frontend de React compilado de forma nativa desde el mismo puerto
const frontendDistPath = path.join(process.cwd(), '../frontend/dist');
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
