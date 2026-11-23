// =========================================================
// CAPA RUTAS - tabla "tipos_habitacion"
// Define las URLs del recurso y asocia cada una con su
// función del controlador. No contiene lógica de negocio.
//
//   GET    /api/tipos-habitacion       -> consultar todos
//   GET    /api/tipos-habitacion/:id   -> consultar por ID
//   POST   /api/tipos-habitacion       -> crear
//   PUT    /api/tipos-habitacion/:id   -> actualizar
//   DELETE /api/tipos-habitacion/:id   -> eliminar
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/tiposHabitacionController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Todas las rutas exigen autenticación.
// Consultar: cualquier usuario autenticado.
// Escribir: solo Administrador (funcionalidad exclusiva).
router.use(authenticate);

// Consultar todos los tipos de habitación
router.get('/', controlador.obtenerTipos);

// Consultar un tipo de habitación por su ID
router.get('/:id', controlador.obtenerTipoPorId);

// Crear un nuevo tipo de habitación
router.post('/', authorizeRoles(ROLES.ADMINISTRADOR), controlador.crearTipo);

// Actualizar un tipo de habitación existente
router.put('/:id', authorizeRoles(ROLES.ADMINISTRADOR), controlador.actualizarTipo);

// Eliminar un tipo de habitación
router.delete('/:id', authorizeRoles(ROLES.ADMINISTRADOR), controlador.eliminarTipo);

export default router;
