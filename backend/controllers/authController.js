// =========================================================
// CONTROLADOR DE AUTENTICACIÓN
//
//   POST /api/auth/login    -> access + refresh token
//   POST /api/auth/refresh  -> renueva tokens (solo refresh)
//   GET  /api/auth/me       -> usuario autenticado
//   POST /api/auth/logout   -> cierre de sesión (stateless)
// =========================================================

import usuarioModel from '../models/usuarioModel.js';
import { verifyPassword } from '../utils/password.js';
import {
  firmarAccessToken,
  firmarRefreshToken,
  verificarRefreshToken,
  JWT_CONFIG,
} from '../utils/jwt.js';

const CREDENCIALES_INVALIDAS = 'Credenciales inválidas.';

function usuarioPublico(usuario) {
  const { password_hash, ...publico } = usuario;
  return publico;
}

function extraerRefreshToken(body = {}) {
  return body.refreshToken || body.refresh_token || null;
}

// ---------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------
const login = async (req, res) => {
  try {
    const body = req.body || {};
    const identificador =
      body.identificador || body.nombre_usuario || body.correo || body.email;
    const password = body.password || body.contrasena;

    if (typeof identificador !== 'string' || identificador.trim() === '') {
      return res.status(400).json({
        mensaje: 'Debe indicar el nombre de usuario o correo.',
      });
    }

    if (typeof password !== 'string' || password === '') {
      return res.status(400).json({
        mensaje: 'Debe indicar la contraseña.',
      });
    }

    const usuario = await usuarioModel.obtenerPorCredencial(identificador.trim());

    // Mensaje genérico: no se revela si el usuario existe o no.
    if (!usuario) {
      return res.status(401).json({ mensaje: CREDENCIALES_INVALIDAS });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(401).json({
        mensaje: 'La cuenta está inactiva. Contacte al administrador.',
      });
    }

    const passwordCorrecta = await verifyPassword(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: CREDENCIALES_INVALIDAS });
    }

    const publico = usuarioPublico(usuario);
    const accessToken = firmarAccessToken(publico);
    const refreshToken = firmarRefreshToken(publico);

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      tokenType: 'Bearer',
      expiresIn: JWT_CONFIG.ACCESS_EXPIRES_IN,
      accessToken,
      refreshToken,
      usuario: publico,
    });
  } catch (err) {
    console.error('[auth] Error en login:', err);
    return res.status(500).json({
      mensaje: 'Error interno del servidor al iniciar sesión.',
    });
  }
};

// ---------------------------------------------------------
// POST /api/auth/refresh
// Solo acepta tokens firmados con el secreto de refresh y
// con typ="refresh". Un access token aquí devuelve 401.
// ---------------------------------------------------------
const refresh = async (req, res) => {
  try {
    const token = extraerRefreshToken(req.body || {});

    if (!token) {
      return res.status(401).json({
        mensaje: 'Refresh token ausente o inválido.',
      });
    }

    let payload;
    try {
      payload = verificarRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        mensaje: 'Refresh token inválido o expirado.',
      });
    }

    const usuario = await usuarioModel.obtenerPorId(Number(payload.sub));

    if (!usuario || usuario.estado !== 'ACTIVO') {
      return res.status(401).json({
        mensaje: 'La sesión ya no es válida. Inicie sesión nuevamente.',
      });
    }

    const accessToken = firmarAccessToken(usuario);
    const refreshToken = firmarRefreshToken(usuario);

    return res.status(200).json({
      mensaje: 'Sesión renovada correctamente.',
      tokenType: 'Bearer',
      expiresIn: JWT_CONFIG.ACCESS_EXPIRES_IN,
      accessToken,
      refreshToken,
      usuario,
    });
  } catch (err) {
    console.error('[auth] Error en refresh:', err);
    return res.status(500).json({
      mensaje: 'Error interno del servidor al renovar la sesión.',
    });
  }
};

// ---------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------
const me = async (req, res) => {
  return res.status(200).json({ usuario: req.usuario });
};

// ---------------------------------------------------------
// POST /api/auth/logout
// Con JWT stateless no hay lista de revocación: el cliente
// elimina sus tokens locales. El endpoint existe para que el
// frontend tenga un cierre de sesión explícito y uniforme.
// ---------------------------------------------------------
const logout = async (req, res) => {
  return res.status(200).json({
    mensaje: 'Sesión cerrada correctamente. Elimine los tokens en el cliente.',
  });
};

export default { login, refresh, me, logout };
