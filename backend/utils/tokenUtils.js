// =========================================================
// Utilidades para firmar y verificar los tokens JWT.
// Los secretos y tiempos de expiración se leen de variables
// de entorno, nunca se escriben en el código.
// =========================================================

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES_POR_DEFECTO = '15m';
const REFRESH_EXPIRES_POR_DEFECTO = '7d';

const obtenerSecretoAccess = () => {
  const secreto = process.env.JWT_ACCESS_SECRET;
  if (!secreto) {
    throw new Error('Falta la variable de entorno JWT_ACCESS_SECRET.');
  }
  return secreto;
};

const obtenerSecretoRefresh = () => {
  const secreto = process.env.JWT_REFRESH_SECRET;
  if (!secreto) {
    throw new Error('Falta la variable de entorno JWT_REFRESH_SECRET.');
  }
  return secreto;
};

// El access token identifica al usuario y su rol. El refresh token solo
// sirve para renovar la sesión: no se acepta en rutas protegidas.
const firmarAccessToken = (usuario) =>
  jwt.sign(
    {
      sub: usuario.id_usuario,
      rol: usuario.rol,
      id_cliente: usuario.id_cliente ?? null,
      id_empleado: usuario.id_empleado ?? null,
      tipo: 'access',
    },
    obtenerSecretoAccess(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_EXPIRES_POR_DEFECTO }
  );

const firmarRefreshToken = (usuario) =>
  jwt.sign(
    {
      sub: usuario.id_usuario,
      tipo: 'refresh',
      // Identificador único: evita que dos logins en el mismo segundo
      // generen exactamente el mismo token (y choquen en token_hash).
      jti: crypto.randomUUID(),
    },
    obtenerSecretoRefresh(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || REFRESH_EXPIRES_POR_DEFECTO }
  );

const verificarAccessToken = (token) => {
  const payload = jwt.verify(token, obtenerSecretoAccess());
  if (payload.tipo !== 'access') {
    throw new jwt.JsonWebTokenError('El token no es un access token.');
  }
  return payload;
};

const verificarRefreshToken = (token) => {
  const payload = jwt.verify(token, obtenerSecretoRefresh());
  if (payload.tipo !== 'refresh') {
    throw new jwt.JsonWebTokenError('El token no es un refresh token.');
  }
  return payload;
};

// Se guarda únicamente el hash del refresh token en la base de datos.
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const leerExpiracion = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    throw new jwt.JsonWebTokenError('El token no contiene expiración.');
  }
  return new Date(decoded.exp * 1000);
};

export {
  firmarAccessToken,
  firmarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  hashToken,
  leerExpiracion,
};
