// =========================================================
// ESQUELETO - CHECK-IN / CHECK-OUT (rol Recepcionista)
//
// TODO(equipo): implementar la funcionalidad exclusiva del
// Recepcionista usando las tablas check_ins y check_outs.
//
// Reglas que debe cumplir la implementación:
//   1. Solo el Recepcionista puede ejecutar check-in/check-out.
//      El Administrador puede consultar si el equipo lo decide,
//      pero no ejecutar.
//   2. El check-in exige una reserva existente y en estado válido
//      (por ejemplo CONFIRMADA); debe registrar realizado_por con
//      el id_empleado del recepcionista autenticado.
//   3. El check-out exige un check-in previo y una reserva en
//      estado CHECKIN.
//   4. Actualizar el estado de la reserva y de la habitación de
//      forma coherente dentro de una transacción.
//   5. Manejar 23503/23001/23505 con respuestas 400 claras.
//
// Endpoints ya montados con authenticate + authorizeRoles(Recepcionista):
//   GET  /api/recepcion/checkins
//   POST /api/recepcion/checkins
//   GET  /api/recepcion/checkins/:id
//   GET  /api/recepcion/checkouts
//   POST /api/recepcion/checkouts
//   GET  /api/recepcion/checkouts/:id
// =========================================================

import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(ROLES.RECEPCIONISTA));

function pendiente(accion) {
  return (req, res) => {
    return res.status(501).json({
      mensaje: `Pendiente de implementación por el equipo: ${accion}.`,
      endpoint: `${req.method} ${req.originalUrl}`,
    });
  };
}

router.get('/checkins', pendiente('listar check-ins'));
router.post('/checkins', pendiente('registrar un check-in'));
router.get('/checkins/:id', pendiente('consultar un check-in'));
router.get('/checkouts', pendiente('listar check-outs'));
router.post('/checkouts', pendiente('registrar un check-out'));
router.get('/checkouts/:id', pendiente('consultar un check-out'));

export default router;
