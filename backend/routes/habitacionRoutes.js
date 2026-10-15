// Rutas del CRUD de habitaciones.
import { Router } from 'express';
import controlador from '../controllers/habitacionController.js';

const router = Router();

router.get('/', controlador.obtenerHabitaciones);
router.get('/:id', controlador.obtenerHabitacionPorId);
router.post('/', controlador.crearHabitacion);
router.put('/:id', controlador.actualizarHabitacion);
router.delete('/:id', controlador.eliminarHabitacion);

export default router;
