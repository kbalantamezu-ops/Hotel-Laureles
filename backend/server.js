import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de rutas
import authRoutes from './routes/authRoutes.js';
import habitacionRoutes from './routes/habitacionRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';
import tiposHabitacionRoutes from './routes/tiposHabitacionRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import { autenticar } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);
app.use(express.json());

// Rutas públicas de autenticación
app.use('/api/auth', authRoutes);

// Rutas protegidas: aquí se valida que el usuario esté autenticado.
// Cada módulo agrega en su propio router las validaciones de rol y propiedad.
app.use('/api/habitaciones', autenticar, habitacionRoutes);
app.use('/api/reservas', autenticar, reservaRoutes);
app.use('/api/clientes', autenticar, clienteRoutes);
app.use('/api/tipos-habitacion', autenticar, tiposHabitacionRoutes);

// Ruta de estado del servidor (pública)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor Express de Hotel Los Laureles corriendo correctamente',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
