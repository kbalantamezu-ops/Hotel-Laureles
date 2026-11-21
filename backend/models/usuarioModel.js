// Modelo base de usuarios para autenticación.
// La Parte 2 (gestión de usuarios) amplía este archivo con el CRUD.
import pool from '../config/db.js';

// Datos públicos del usuario: nunca incluye password_hash.
const CAMPOS_PUBLICOS = `
  u.id_usuario,
  u.id_rol,
  r.nombre AS rol,
  u.nombre_usuario,
  u.correo,
  u.estado,
  u.fecha_creacion,
  c.id_cliente,
  e.id_empleado
`;

const JOINS = `
  FROM usuarios u
  JOIN roles r ON r.id_rol = u.id_rol
  LEFT JOIN clientes c ON c.id_usuario = u.id_usuario
  LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
`;

const buscarPorCorreo = async (correo) => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, u.password_hash
     ${JOINS}
     WHERE lower(u.correo) = lower($1)
     LIMIT 1`,
    [correo]
  );
  return rows[0];
};

const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     ${JOINS}
     WHERE u.id_usuario = $1
     LIMIT 1`,
    [id]
  );
  return rows[0];
};

export default { buscarPorCorreo, buscarPorId };
