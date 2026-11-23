// =========================================================
// UTILIDADES DE CONTRASEÑAS
// Toda contraseña se guarda como hash bcrypt (bcryptjs).
// Nunca se devuelve ni se registra la contraseña en claro.
// =========================================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // límite práctico de bcrypt

export default { hashPassword, verifyPassword, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH };
