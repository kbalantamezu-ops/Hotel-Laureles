// Rutas del CRUD de habitaciones.
// Consultar: cualquier autenticado (Recepción necesita ver disponibilidad).
// Escribir: solo Administrador (funcionalidad exclusiva).
import { Router } from 'express';
import controlador from '../controllers/habitacionController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', controlador.obtenerHabitaciones);
router.get('/:id', controlador.obtenerHabitacionPorId);
router.post('/', authorizeRoles(ROLES.ADMINISTRADOR), controlador.crearHabitacion);
router.put('/:id', authorizeRoles(ROLES.ADMINISTRADOR), controlador.actualizarHabitacion);
router.delete('/:id', authorizeRoles(ROLES.ADMINISTRADOR), controlador.eliminarHabitacion);

export default router;
