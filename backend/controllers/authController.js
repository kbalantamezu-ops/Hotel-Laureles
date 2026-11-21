// Controlador de autenticación: login, refresh, logout y usuario actual.
import bcrypt from 'bcryptjs';
import usuarioModel from '../models/usuarioModel.js';
import refreshTokenModel from '../models/refreshTokenModel.js';
import {
  firmarAccessToken,
  firmarRefreshToken,
  verificarRefreshToken,
  hashToken,
  leerExpiracion,
} from '../utils/tokenUtils.js';

const usuarioPublico = (usuario) => ({
  id_usuario: usuario.id_usuario,
  id_rol: usuario.id_rol,
  rol: usuario.rol,
  nombre_usuario: usuario.nombre_usuario,
  correo: usuario.correo,
  estado: usuario.estado,
  id_cliente: usuario.id_cliente ?? null,
  id_empleado: usuario.id_empleado ?? null,
});

const responderError500 = (res, err) => {
  console.error('[auth] Error:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al procesar la autenticación.',
  });
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body || {};
    const errores = [];

    if (typeof correo !== 'string' || correo.trim() === '') {
      errores.push('El campo "correo" es obligatorio.');
    }
    if (typeof password !== 'string' || password === '') {
      errores.push('El campo "password" es obligatorio.');
    }
    if (errores.length) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }

    const usuario = await usuarioModel.buscarPorCorreo(correo.trim());

    // Mismo mensaje para correo inexistente y contraseña incorrecta.
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({
        mensaje: 'La cuenta está inactiva. Contacte al administrador.',
      });
    }

    const accessToken = firmarAccessToken(usuario);
    const refreshToken = firmarRefreshToken(usuario);

    await refreshTokenModel.crear({
      id_usuario: usuario.id_usuario,
      token_hash: hashToken(refreshToken),
      expira_en: leerExpiracion(refreshToken),
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
      usuario: usuarioPublico(usuario),
    });
  } catch (err) {
    return responderError500(res, err);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (typeof refreshToken !== 'string' || refreshToken === '') {
      return res.status(400).json({
        mensaje: 'El campo "refreshToken" es obligatorio.',
      });
    }

    let payload;
    try {
      payload = verificarRefreshToken(refreshToken);
    } catch (_err) {
      return res.status(401).json({ mensaje: 'Refresh token inválido o expirado.' });
    }

    const tokenHash = hashToken(refreshToken);
    // Rotación atómica: solo una petición puede canjear este refresh token.
    const registro = await refreshTokenModel.consumir(tokenHash);
    if (!registro || String(registro.id_usuario) !== String(payload.sub)) {
      return res.status(401).json({
        mensaje: 'Refresh token inválido o revocado.',
      });
    }

    const usuario = await usuarioModel.buscarPorId(registro.id_usuario);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'El usuario ya no existe.' });
    }
    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({
        mensaje: 'La cuenta está inactiva. Contacte al administrador.',
      });
    }

    const nuevoAccessToken = firmarAccessToken(usuario);
    const nuevoRefreshToken = firmarRefreshToken(usuario);

    await refreshTokenModel.crear({
      id_usuario: usuario.id_usuario,
      token_hash: hashToken(nuevoRefreshToken),
      expira_en: leerExpiracion(nuevoRefreshToken),
    });

    return res.status(200).json({
      accessToken: nuevoAccessToken,
      refreshToken: nuevoRefreshToken,
      usuario: usuarioPublico(usuario),
    });
  } catch (err) {
    return responderError500(res, err);
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (typeof refreshToken === 'string' && refreshToken !== '') {
      // Si el token no es válido, el cierre de sesión igual se considera exitoso.
      try {
        const payload = verificarRefreshToken(refreshToken);
        // Solo se revoca si el refresh pertenece al usuario autenticado.
        if (String(payload.sub) === String(req.usuario.id)) {
          await refreshTokenModel.revocar(hashToken(refreshToken));
        }
      } catch (_err) {
        // No se revoca nada: el token ya no sirve.
      }
    } else {
      // Sin refresh token explícito se cierran todas las sesiones del usuario.
      await refreshTokenModel.revocarTodosDeUsuario(req.usuario.id);
    }

    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
  } catch (err) {
    return responderError500(res, err);
  }
};

const me = async (req, res) => {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    return res.status(200).json(usuarioPublico(usuario));
  } catch (err) {
    return responderError500(res, err);
  }
};

export default { login, refresh, logout, me };
