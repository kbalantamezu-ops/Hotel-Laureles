// Rutas de autenticación.
//   POST /api/auth/login    -> iniciar sesión (público)
//   POST /api/auth/refresh  -> renovar access token (refresh token)
//   POST /api/auth/logout   -> cerrar sesión (requiere access token)
//   GET  /api/auth/me       -> usuario autenticado
import { Router } from 'express';
import controlador from '../controllers/authController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', controlador.login);
router.post('/refresh', controlador.refresh);
router.post('/logout', autenticar, controlador.logout);
router.get('/me', autenticar, controlador.me);

export default router;
