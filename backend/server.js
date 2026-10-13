import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de rutas
// (authRoutes, habitacionRoutes y reservaRoutes quedaron comentados porque
//  esos archivos aún no existen en routes/; se descomentean al crearse)
// import authRoutes from './routes/authRoutes.js';
// import habitacionRoutes from './routes/habitacionRoutes.js';
// import reservaRoutes from './routes/reservaRoutes.js';
// Ruta del CRUD de tipos de habitación (Tarea 2)
import tiposHabitacionRoutes from './routes/tiposHabitacionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas base de la API
// app.use('/api/auth', authRoutes);
// app.use('/api/habitaciones', habitacionRoutes);
// app.use('/api/reservas', reservaRoutes);

// Montaje del CRUD de tipos de habitación (Tarea 2)
app.use('/api/tipos-habitacion', tiposHabitacionRoutes);

// Ruta de estado del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor Express de Hotel Los Laureles corriendo correctamente',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});