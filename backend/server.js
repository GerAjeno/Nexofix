import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './database.js';
import clientesRoutes from './routes/clientes.js';
import cotizacionesRoutes from './routes/cotizaciones.js';
import plantillasRoutes from './routes/plantillas.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
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

// Ruta básica de salud y comprobación de estado de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'La API de NexoFix está en funcionamiento' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
