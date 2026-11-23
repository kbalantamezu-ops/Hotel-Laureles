// =========================================================
// Middlewares de autenticación y autorización.
//
// - autenticar: exige un access token válido (401 si falta o falla).
// - autorizarRoles: exige que el rol esté permitido (403 si no).
// - autorizarPropietario: exige que el recurso pertenezca al cliente
//   autenticado (403 si es de otro usuario).
// =========================================================

import { verificarAccessToken } from '../utils/tokenUtils.js';

const extraerToken = (req) => {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');
  return esquema && esquema.toLowerCase() === 'bearer' && token ? token : null;
};

const autenticar = (req, res, next) => {
  const token = extraerToken(req);
  if (!token) {
    return res.status(401).json({
      mensaje: 'No autenticado: token de acceso no proporcionado.',
    });
  }

  try {
    const payload = verificarAccessToken(token);
    req.usuario = {
      id: payload.sub,
      rol: payload.rol,
      id_cliente: payload.id_cliente ?? null,
      id_empleado: payload.id_empleado ?? null,
    };
    return next();
  } catch (err) {
    const mensaje =
      err.name === 'TokenExpiredError'
        ? 'El token de acceso ha expirado.'
        : 'Token de acceso inválido.';
    return res.status(401).json({ mensaje });
  }
};

const autorizarRoles = (...roles) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: 'No autenticado.' });
  }
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({
      mensaje: 'No tiene permisos para realizar esta acción.',
    });
  }
  return next();
};

// Uso: router.get('/:id', autenticar, autorizarPropietario(async (req) => {
//   const reserva = await reservaModel.obtenerPorId(req.params.id);
//   return reserva?.id_cliente;
// }), controlador);
// El callback debe devolver el id_cliente dueño del recurso, o null/undefined
// si el recurso no existe (en ese caso se responde 404).
const autorizarPropietario = (obtenerDueno) => async (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: 'No autenticado.' });
  }

  try {
    const dueno = await obtenerDueno(req);
    if (dueno === null || dueno === undefined) {
      return res.status(404).json({ mensaje: 'El recurso no existe.' });
    }
    if (String(dueno) !== String(req.usuario.id_cliente)) {
      return res.status(403).json({
        mensaje: 'No tiene permisos sobre este recurso.',
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

export { autenticar, autorizarRoles, autorizarPropietario };
