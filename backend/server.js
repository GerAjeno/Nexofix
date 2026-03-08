import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './database.js';
import clientesRoutes from './routes/clientes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up file uploads
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

// Routes
app.use('/api/clientes', clientesRoutes);

// File upload endpoint for special notes/images
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  // Return the path relative to the server so frontend can store it
  res.status(200).json({ 
    message: 'Imagen subida exitosamente', 
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(uploadDir));

// Basic health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NexoFix API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
