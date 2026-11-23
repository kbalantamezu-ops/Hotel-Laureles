// =========================================================
// CAPA MODELO - tabla "roles"
// Solo consultas SQL parametrizadas. No decide códigos HTTP.
// =========================================================

import pool from '../config/db.js';

const COLUMNAS = 'id_rol, nombre, descripcion';

const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM roles
     ORDER BY id_rol ASC`
  );
  return rows;
};

const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM roles
     WHERE id_rol = $1`,
    [id]
  );
  return rows[0];
};

const obtenerPorNombre = async (nombre) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM roles
     WHERE lower(nombre) = lower($1)`,
    [nombre]
  );
  return rows[0];
};

export default {
  obtenerTodos,
  obtenerPorId,
  obtenerPorNombre,
};
