import { Router } from 'express';
import controlador from '../controllers/misReservasController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();
router.use(authenticate, authorizeRoles(ROLES.CLIENTE));
router.get('/', controlador.listar);
router.post('/', controlador.crear);
router.get('/:id', controlador.consultar);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.cancelar);

export default router;
