// =========================================================
// MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
//
// Códigos usados:
//   401 -> no autenticado, token ausente, inválido o expirado.
//   403 -> autenticado pero sin permisos suficientes.
// =========================================================

import usuarioModel from '../models/usuarioModel.js';
import { verificarAccessToken } from '../utils/jwt.js';
import { ROLES } from '../config/roles.js';

function extraerBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

// ---------------------------------------------------------
// authenticate
// Valida el access token, comprueba que el usuario siga activo
// y adjunta req.usuario con el rol actual desde la base de datos.
// ---------------------------------------------------------
export async function authenticate(req, res, next) {
  const token = extraerBearer(req);

  if (!token) {
    return res.status(401).json({
      mensaje: 'No autenticado. Debe iniciar sesión.',
    });
  }

  let payload;
  try {
    payload = verificarAccessToken(token);
  } catch (err) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado. Inicie sesión nuevamente.',
    });
  }

  try {
    const usuario = await usuarioModel.obtenerPorId(Number(payload.sub));

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'La sesión ya no es válida. Inicie sesión nuevamente.',
      });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(401).json({
        mensaje: 'La cuenta está inactiva. Contacte al administrador.',
      });
    }

    req.usuario = usuario;
    req.tokenPayload = payload;
    return next();
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------
// authorizeRoles
// Uso: router.post('/', authorizeRoles(ROLES.ADMINISTRADOR), handler)
// Debe ejecutarse después de authenticate.
// ---------------------------------------------------------
export function authorizeRoles(...rolesPermitidos) {
  const permitidos = new Set(rolesPermitidos);

  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'No autenticado. Debe iniciar sesión.',
      });
    }

    if (!permitidos.has(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos para realizar esta acción.',
      });
    }

    return next();
  };
}

// ---------------------------------------------------------
// isOwner
// Middleware reutilizable para validar propiedad de un recurso.
//
// Opciones:
//   obtenerRecurso(id) -> registro o undefined
//   obtenerIdUsuarioPropietario(recurso) -> id_usuario dueño
//   rolesExentos -> roles que pueden acceder sin ser dueños
//   param -> nombre del parámetro de ruta (por defecto "id")
// ---------------------------------------------------------
export function isOwner({
  obtenerRecurso,
  obtenerIdUsuarioPropietario,
  rolesExentos = [ROLES.ADMINISTRADOR],
  param = 'id',
  mensaje = 'No tiene permisos sobre este recurso.',
}) {
  const exentos = new Set(rolesExentos);

  return async (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'No autenticado. Debe iniciar sesión.',
      });
    }

    if (exentos.has(req.usuario.rol)) {
      return next();
    }

    try {
      const recurso = await obtenerRecurso(req.params[param]);

      if (!recurso) {
        return res.status(404).json({
          mensaje: 'El recurso solicitado no existe.',
        });
      }

      const propietarioId = obtenerIdUsuarioPropietario(recurso);

      if (Number(propietarioId) !== Number(req.usuario.id_usuario)) {
        return res.status(403).json({ mensaje });
      }

      req.recurso = recurso;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export default { authenticate, authorizeRoles, isOwner };
