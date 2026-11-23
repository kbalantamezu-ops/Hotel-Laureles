// =========================================================
// RUTAS DE ROLES
// Catálogo para el formulario de creación/edición de usuarios.
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/rolController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMINISTRADOR),
  controlador.listar
);

export default router;
