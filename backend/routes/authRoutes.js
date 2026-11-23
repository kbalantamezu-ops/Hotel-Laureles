// =========================================================
// RUTAS DE AUTENTICACIÓN
//
//   POST /api/auth/login    -> público
//   POST /api/auth/refresh  -> público (exige refresh token)
//   POST /api/auth/logout   -> público (stateless)
//   GET  /api/auth/me       -> requiere access token
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', controlador.login);
router.post('/refresh', controlador.refresh);
router.post('/logout', controlador.logout);
router.get('/me', authenticate, controlador.me);

export default router;
