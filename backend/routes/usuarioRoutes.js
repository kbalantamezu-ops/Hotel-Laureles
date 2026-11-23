// =========================================================
// RUTAS DE GESTIÓN DE USUARIOS
// Todas requieren access token y rol Administrador.
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/usuarioController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(ROLES.ADMINISTRADOR));

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.patch('/:id/rol', controlador.cambiarRol);
router.patch('/:id/password', controlador.cambiarPassword);
router.delete('/:id', controlador.eliminar);

export default router;
