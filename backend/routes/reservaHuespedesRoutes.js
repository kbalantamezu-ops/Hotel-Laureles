import { Router } from 'express';
import controlador from '../controllers/reservaHuespedesController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router({ mergeParams: true });
router.use(authenticate);
router.get('/', authorizeRoles(ROLES.CLIENTE, ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR), controlador.listar);
router.post('/', authorizeRoles(ROLES.CLIENTE), controlador.agregar);
router.delete('/:idHuesped', authorizeRoles(ROLES.CLIENTE), controlador.eliminar);

export default router;
