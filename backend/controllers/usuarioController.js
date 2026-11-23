// =========================================================
// CONTROLADOR DE GESTIÓN DE USUARIOS (solo Administrador)
//
// Nunca devuelve password_hash. Las consultas públicas del
// modelo seleccionan explícitamente las columnas seguras.
// =========================================================

import usuarioModel from '../models/usuarioModel.js';
import rolModel from '../models/rolModel.js';
import {
  hashPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../utils/password.js';
import { ESTADOS_USUARIO, ROLES } from '../config/roles.js';

const esIdValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const RE_NOMBRE_USUARIO = /^[a-zA-Z0-9._-]{3,50}$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarPassword(password, errores) {
  if (typeof password !== 'string' || password === '') {
    errores.push('La contraseña es obligatoria.');
    return;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errores.push(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errores.push(`La contraseña no puede superar ${PASSWORD_MAX_LENGTH} caracteres.`);
  }
}

function validarDatosBasicos(body, { crear, errores }) {
  if (crear || body.nombre_usuario !== undefined) {
    if (typeof body.nombre_usuario !== 'string' || body.nombre_usuario.trim() === '') {
      errores.push('El nombre de usuario es obligatorio.');
    } else if (!RE_NOMBRE_USUARIO.test(body.nombre_usuario.trim())) {
      errores.push(
        'El nombre de usuario debe tener entre 3 y 50 caracteres y solo puede '
          + 'incluir letras, números, punto, guion y guion bajo.'
      );
    }
  }

  if (crear || body.correo !== undefined) {
    if (typeof body.correo !== 'string' || body.correo.trim() === '') {
      errores.push('El correo es obligatorio.');
    } else if (!RE_CORREO.test(body.correo.trim()) || body.correo.trim().length > 100) {
      errores.push('El correo no tiene un formato válido o supera los 100 caracteres.');
    }
  }

  if (body.estado !== undefined && !ESTADOS_USUARIO.includes(body.estado)) {
    errores.push(`El estado debe ser uno de: ${ESTADOS_USUARIO.join(', ')}.`);
  }
}

// Resuelve el rol por id o por nombre. Devuelve undefined si no existe.
async function resolverRol(body) {
  if (body.id_rol !== undefined) {
    if (!Number.isInteger(body.id_rol) || body.id_rol <= 0) return null;
    return rolModel.obtenerPorId(body.id_rol);
  }

  if (typeof body.rol === 'string' && body.rol.trim() !== '') {
    return rolModel.obtenerPorNombre(body.rol.trim());
  }

  return null;
}

const responderError500 = (res, contexto, err) => {
  console.error(`[usuarios] Error en ${contexto}:`, err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al procesar la solicitud.',
  });
};

const responderErrorUnico = (res) => {
  return res.status(400).json({
    mensaje: 'Ya existe un usuario con ese nombre de usuario o correo.',
  });
};

// ---------------------------------------------------------
// GET /api/usuarios
// ---------------------------------------------------------
const listar = async (req, res) => {
  try {
    const usuarios = await usuarioModel.obtenerTodos();
    return res.status(200).json(usuarios);
  } catch (err) {
    return responderError500(res, 'listar', err);
  }
};

// ---------------------------------------------------------
// GET /api/usuarios/:id
// ---------------------------------------------------------
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const usuario = await usuarioModel.obtenerPorId(Number(id));

    if (!usuario) {
      return res.status(404).json({
        mensaje: `No existe un usuario con ID ${id}.`,
      });
    }

    return res.status(200).json(usuario);
  } catch (err) {
    return responderError500(res, 'obtener por ID', err);
  }
};

// ---------------------------------------------------------
// POST /api/usuarios
// ---------------------------------------------------------
const crear = async (req, res) => {
  try {
    const body = req.body || {};
    const errores = [];

    validarDatosBasicos(body, { crear: true, errores });
    validarPassword(body.password, errores);

    if (body.id_rol === undefined && !body.rol) {
      errores.push('Debe indicar el rol del usuario.');
    }

    if (errores.length > 0) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }

    const rol = await resolverRol(body);

    if (!rol) {
      return res.status(400).json({
        mensaje: 'El rol indicado no existe.',
      });
    }

    const password_hash = await hashPassword(body.password);

    const usuario = await usuarioModel.crear({
      id_rol: rol.id_rol,
      nombre_usuario: body.nombre_usuario.trim(),
      correo: body.correo.trim().toLowerCase(),
      password_hash,
      estado: body.estado || 'ACTIVO',
    });

    return res.status(201).json({
      mensaje: 'Usuario creado correctamente.',
      usuario,
    });
  } catch (err) {
    if (err.code === '23505') return responderErrorUnico(res);
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: 'El rol indicado no existe.' });
    }
    return responderError500(res, 'crear', err);
  }
};

// ---------------------------------------------------------
// PUT /api/usuarios/:id
// Actualiza datos básicos. El rol se cambia en un endpoint aparte.
// ---------------------------------------------------------
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const body = req.body || {};

    if (body.id_rol !== undefined || body.rol !== undefined) {
      return res.status(400).json({
        mensaje: 'Para cambiar el rol use PATCH /api/usuarios/:id/rol.',
      });
    }

    const campos = ['nombre_usuario', 'correo', 'estado'];
    const alguno = campos.some((campo) => body[campo] !== undefined);

    if (!alguno) {
      return res.status(400).json({
        mensaje: 'Debe enviar al menos uno de los campos: nombre_usuario, correo, estado.',
      });
    }

    const errores = [];
    validarDatosBasicos(body, { crear: false, errores });

    if (errores.length > 0) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }

    if (
      Number(id) === Number(req.usuario.id_usuario)
      && body.estado !== undefined
      && body.estado !== 'ACTIVO'
    ) {
      return res.status(400).json({
        mensaje: 'No puede desactivar su propia cuenta.',
      });
    }

    const datos = {};
    if (body.nombre_usuario !== undefined) {
      datos.nombre_usuario = body.nombre_usuario.trim();
    }
    if (body.correo !== undefined) {
      datos.correo = body.correo.trim().toLowerCase();
    }
    if (body.estado !== undefined) {
      datos.estado = body.estado;
    }

    const usuario = await usuarioModel.actualizar(Number(id), datos);

    if (!usuario) {
      return res.status(404).json({
        mensaje: `No existe un usuario con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: 'Usuario actualizado correctamente.',
      usuario,
    });
  } catch (err) {
    if (err.code === '23505') return responderErrorUnico(res);
    return responderError500(res, 'actualizar', err);
  }
};

// ---------------------------------------------------------
// PATCH /api/usuarios/:id/rol
// ---------------------------------------------------------
const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const body = req.body || {};

    if (body.id_rol === undefined && !body.rol) {
      return res.status(400).json({
        mensaje: 'Debe indicar el nuevo rol (id_rol o rol).',
      });
    }

    const rol = await resolverRol(body);

    if (!rol) {
      return res.status(400).json({ mensaje: 'El rol indicado no existe.' });
    }

    const actual = await usuarioModel.obtenerPorId(Number(id));

    if (!actual) {
      return res.status(404).json({
        mensaje: `No existe un usuario con ID ${id}.`,
      });
    }

    const esUnoMismo = Number(id) === Number(req.usuario.id_usuario);
    const dejaDeSerAdmin =
      actual.rol === ROLES.ADMINISTRADOR && rol.nombre !== ROLES.ADMINISTRADOR;

    if (esUnoMismo && dejaDeSerAdmin) {
      return res.status(400).json({
        mensaje: 'No puede quitarse el rol de Administrador a sí mismo.',
      });
    }

    if (dejaDeSerAdmin && actual.estado === 'ACTIVO') {
      const otrosAdmins = await usuarioModel.contarAdministradoresActivos(Number(id));
      if (otrosAdmins === 0) {
        return res.status(400).json({
          mensaje: 'Debe existir al menos un Administrador activo en el sistema.',
        });
      }
    }

    const usuario = await usuarioModel.actualizarRol(Number(id), rol.id_rol);

    return res.status(200).json({
      mensaje: 'Rol actualizado correctamente.',
      usuario,
    });
  } catch (err) {
    return responderError500(res, 'cambiar rol', err);
  }
};

// ---------------------------------------------------------
// PATCH /api/usuarios/:id/password
// ---------------------------------------------------------
const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const errores = [];
    validarPassword(req.body?.password, errores);

    if (errores.length > 0) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }

    const password_hash = await hashPassword(req.body.password);
    const actualizado = await usuarioModel.actualizarPassword(Number(id), password_hash);

    if (!actualizado) {
      return res.status(404).json({
        mensaje: `No existe un usuario con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: 'Contraseña actualizada correctamente.',
    });
  } catch (err) {
    return responderError500(res, 'cambiar contraseña', err);
  }
};

// ---------------------------------------------------------
// DELETE /api/usuarios/:id
// ---------------------------------------------------------
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    if (Number(id) === Number(req.usuario.id_usuario)) {
      return res.status(400).json({
        mensaje: 'No puede eliminar su propia cuenta.',
      });
    }

    const usuario = await usuarioModel.obtenerPorId(Number(id));

    if (!usuario) {
      return res.status(404).json({
        mensaje: `No existe un usuario con ID ${id}.`,
      });
    }

    if (usuario.rol === ROLES.ADMINISTRADOR && usuario.estado === 'ACTIVO') {
      const otrosAdmins = await usuarioModel.contarAdministradoresActivos(Number(id));
      if (otrosAdmins === 0) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar al último Administrador activo.',
        });
      }
    }

    await usuarioModel.eliminar(Number(id));

    return res.status(200).json({
      mensaje: `Usuario con ID ${id} eliminado correctamente.`,
    });
  } catch (err) {
    if (err.code === '23503' || err.code === '23001') {
      return res.status(400).json({
        mensaje:
          'No se puede eliminar el usuario porque tiene registros asociados '
          + '(por ejemplo, reservas).',
      });
    }
    return responderError500(res, 'eliminar', err);
  }
};

export default {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarRol,
  cambiarPassword,
  eliminar,
};
