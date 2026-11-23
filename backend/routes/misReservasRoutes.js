// =========================================================
// ESQUELETO - MIS RESERVAS (rol Cliente)
//
// TODO(equipo): implementar la funcionalidad exclusiva del Cliente.
//
// Reglas que debe cumplir la implementación:
//   1. Solo el Cliente autenticado puede crear/editar/cancelar
//      SUS propias reservas.
//   2. Para consultar/editar/eliminar una reserva se debe validar
//      la cadena reserva -> cliente -> id_usuario.
//      Se puede reutilizar el middleware isOwner de
//      middlewares/auth.js.
//   3. Un Cliente NUNCA puede modificar reservas de otro Cliente.
//   4. Al crear, el id_cliente no debe aceptarse del body: debe
//      derivarse del usuario autenticado.
//   5. Estados permitidos para el Cliente: creación en PENDIENTE,
//      cancelación a CANCELADA. No puede hacer check-in/out.
//
// Endpoints ya montados con authenticate + authorizeRoles(Cliente):
//   GET    /api/mis-reservas
//   POST   /api/mis-reservas
//   GET    /api/mis-reservas/:id
//   PUT    /api/mis-reservas/:id
//   DELETE /api/mis-reservas/:id   (o PATCH /:id/cancelar)
// =========================================================

import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(ROLES.CLIENTE));

function pendiente(accion) {
  return (req, res) => {
    return res.status(501).json({
      mensaje: `Pendiente de implementación por el equipo: ${accion}.`,
      endpoint: `${req.method} ${req.originalUrl}`,
    });
  };
}

router.get('/', pendiente('listar las reservas del cliente autenticado'));
router.post('/', pendiente('crear una reserva propia'));
router.get('/:id', pendiente('consultar una reserva propia'));
router.put('/:id', pendiente('actualizar una reserva propia'));
router.delete('/:id', pendiente('cancelar/eliminar una reserva propia'));

export default router;
