// =========================================================
// CAPA MODELO - tabla "usuarios"
// Regla de seguridad: las consultas públicas NUNCA incluyen
// password_hash. Solo la consulta de login lo trae, porque
// bcrypt lo necesita para comparar.
// =========================================================

import pool from '../config/db.js';

const CAMPOS_PUBLICOS = `
  u.id_usuario,
  u.id_rol,
  r.nombre AS rol,
  u.nombre_usuario,
  u.correo,
  u.estado,
  u.fecha_creacion
`;

const CAMPOS_ACTUALIZABLES = ['nombre_usuario', 'correo', 'estado'];

// ---------------------------------------------------------
// SELECT - listar todos los usuarios (sin hash)
// ---------------------------------------------------------
const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     ORDER BY u.id_usuario ASC`
  );
  return rows;
};

// ---------------------------------------------------------
// SELECT - usuario por ID (sin hash)
// ---------------------------------------------------------
const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     WHERE u.id_usuario = $1`,
    [id]
  );
  return rows[0];
};

// ---------------------------------------------------------
// SELECT - usuario por nombre de usuario o correo.
// Incluye password_hash SOLO para el flujo de login.
// ---------------------------------------------------------
const obtenerPorCredencial = async (identificador) => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, u.password_hash
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     WHERE lower(u.nombre_usuario) = lower($1)
        OR lower(u.correo) = lower($1)
     LIMIT 1`,
    [identificador]
  );
  return rows[0];
};

// ---------------------------------------------------------
// INSERT - crear usuario. Devuelve el usuario público.
// ---------------------------------------------------------
const crear = async ({ id_rol, nombre_usuario, correo, password_hash, estado }) => {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre_usuario, correo, password_hash, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario`,
    [id_rol, nombre_usuario, correo, password_hash, estado]
  );

  return obtenerPorId(rows[0].id_usuario);
};

// ---------------------------------------------------------
// UPDATE - actualiza solo campos permitidos (sin hash).
// ---------------------------------------------------------
const actualizar = async (id, datos) => {
  const campos = CAMPOS_ACTUALIZABLES.filter(
    (campo) => datos[campo] !== undefined
  );

  if (campos.length === 0) return undefined;

  const valores = [];
  const sets = campos.map((campo, i) => {
    valores.push(datos[campo]);
    return `${campo} = $${i + 1}`;
  });

  valores.push(id);

  const { rowCount } = await pool.query(
    `UPDATE usuarios
     SET ${sets.join(', ')}
     WHERE id_usuario = $${valores.length}`,
    valores
  );

  if (rowCount === 0) return undefined;
  return obtenerPorId(id);
};

// ---------------------------------------------------------
// UPDATE - cambiar rol
// ---------------------------------------------------------
const actualizarRol = async (id, id_rol) => {
  const { rowCount } = await pool.query(
    `UPDATE usuarios
     SET id_rol = $1
     WHERE id_usuario = $2`,
    [id_rol, id]
  );

  if (rowCount === 0) return undefined;
  return obtenerPorId(id);
};

// ---------------------------------------------------------
// UPDATE - cambiar contraseña (recibe el hash ya calculado)
// ---------------------------------------------------------
const actualizarPassword = async (id, password_hash) => {
  const { rowCount } = await pool.query(
    `UPDATE usuarios
     SET password_hash = $1
     WHERE id_usuario = $2`,
    [password_hash, id]
  );
  return rowCount > 0;
};

// ---------------------------------------------------------
// DELETE - eliminar usuario
// ---------------------------------------------------------
const eliminar = async (id) => {
  const { rowCount } = await pool.query(
    'DELETE FROM usuarios WHERE id_usuario = $1',
    [id]
  );
  return rowCount > 0;
};

// ---------------------------------------------------------
// SELECT - contar administradores activos.
// Se usa para impedir dejar el sistema sin ningún admin.
// ---------------------------------------------------------
const contarAdministradoresActivos = async (excluirId = null) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     WHERE r.nombre = 'Administrador'
       AND u.estado = 'ACTIVO'
       AND ($1::int IS NULL OR u.id_usuario <> $1)`,
    [excluirId]
  );
  return rows[0]?.total ?? 0;
};

export default {
  obtenerTodos,
  obtenerPorId,
  obtenerPorCredencial,
  crear,
  actualizar,
  actualizarRol,
  actualizarPassword,
  eliminar,
  contarAdministradoresActivos,
};
