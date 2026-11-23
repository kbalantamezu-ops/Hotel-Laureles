// =========================================================
// RUTAS - tabla "clientes"
//
// Permisos:
//   GET    /api/clientes       -> Administrador, Recepcionista
//   GET    /api/clientes/:id   -> Admin/Recep o el Cliente dueño
//   POST   /api/clientes       -> Administrador, Recepcionista
//   PUT    /api/clientes/:id   -> Administrador, Recepcionista
//   DELETE /api/clientes/:id   -> solo Administrador
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/clienteController.js';
import clienteModel from '../models/clienteModel.js';
import { authenticate, authorizeRoles, isOwner } from '../middlewares/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);

// El cliente solo puede consultar su propio registro.
const propietarioDelCliente = isOwner({
  obtenerRecurso: (id) => clienteModel.obtenerPorId(id),
  obtenerIdUsuarioPropietario: (cliente) => cliente.id_usuario,
  rolesExentos: [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA],
  mensaje: 'No tiene permisos para consultar este cliente.',
});

router.get(
  '/',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA),
  controlador.obtenerClientes
);

router.get(
  '/:id',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.CLIENTE),
  propietarioDelCliente,
  controlador.obtenerClientePorId
);

router.post(
  '/',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA),
  controlador.crearCliente
);

router.put(
  '/:id',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA),
  controlador.actualizarCliente
);

router.delete(
  '/:id',
  authorizeRoles(ROLES.ADMINISTRADOR),
  controlador.eliminarCliente
);

export default router;
