// =========================================================
// UTILIDADES JWT
// - Access token: vida corta, sirve para rutas protegidas.
// - Refresh token: vida larga, SOLO sirve para renovar la sesión.
//
// Se usan secretos distintos y un claim "typ" para que un
// refresh token NUNCA pueda usarse como access token (y viceversa).
// =========================================================

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const ISSUER = process.env.JWT_ISSUER || 'hotel-laureles';
const AUDIENCE = process.env.JWT_AUDIENCE || 'hotel-laureles-web';

// Se mantiene compatibilidad con JWT_SECRET de versiones anteriores,
// pero lo recomendado es definir los dos secretos por separado.
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    'Faltan variables de entorno JWT. Define JWT_ACCESS_SECRET y JWT_REFRESH_SECRET '
      + 'en backend/.env (puedes partir de backend/.env.example).'
  );
}

if (ACCESS_SECRET === REFRESH_SECRET) {
  console.warn(
    '[jwt] WARN: JWT_ACCESS_SECRET y JWT_REFRESH_SECRET son iguales. '
      + 'Usa secretos distintos para separar access y refresh tokens.'
  );
}

const TIPOS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
};

// ---------------------------------------------------------
// Firma de tokens
// ---------------------------------------------------------
function firmar(usuario, typ, secret, expiresIn) {
  const payload = {
    sub: String(usuario.id_usuario),
    nombre_usuario: usuario.nombre_usuario,
    rol: usuario.rol,
    typ,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function firmarAccessToken(usuario) {
  return firmar(usuario, TIPOS.ACCESS, ACCESS_SECRET, ACCESS_EXPIRES_IN);
}

export function firmarRefreshToken(usuario) {
  return firmar(usuario, TIPOS.REFRESH, REFRESH_SECRET, REFRESH_EXPIRES_IN);
}

// ---------------------------------------------------------
// Verificación de tokens
// Lanza un Error si el token es inválido, expiró o no es del
// tipo esperado. El middleware de autenticación lo traduce a 401.
// ---------------------------------------------------------
function verificar(token, secret, typEsperado) {
  const payload = jwt.verify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  if (payload.typ !== typEsperado) {
    const error = new Error('Tipo de token incorrecto.');
    error.code = 'TOKEN_TIPO_INCORRECTO';
    throw error;
  }

  return payload;
}

export function verificarAccessToken(token) {
  return verificar(token, ACCESS_SECRET, TIPOS.ACCESS);
}

export function verificarRefreshToken(token) {
  return verificar(token, REFRESH_SECRET, TIPOS.REFRESH);
}

export const JWT_CONFIG = {
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  TIPOS,
};

export default {
  firmarAccessToken,
  firmarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  JWT_CONFIG,
};
