import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Importación de rutas
import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import rolRoutes from './routes/rolRoutes.js';
import habitacionRoutes from './routes/habitacionRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';
import tiposHabitacionRoutes from './routes/tiposHabitacionRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import misReservasRoutes from './routes/misReservasRoutes.js';
import recepcionRoutes from './routes/recepcionRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas base de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);

// Recursos del hotel
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/tipos-habitacion', tiposHabitacionRoutes);

// Funcionalidades exclusivas por rol (esqueletos con middlewares ya aplicados)
app.use('/api/mis-reservas', misReservasRoutes);
app.use('/api/recepcion', recepcionRoutes);

// Ruta de estado del servidor (pública)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor Express de Hotel Los Laureles corriendo correctamente',
  });
});

// 404 en JSON para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    mensaje: `No existe la ruta ${req.method} ${req.originalUrl}.`,
  });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }

  console.error('[server] Error no controlado:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
