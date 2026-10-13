// =========================================================
// CAPA MODELO - tabla "tipos_habitacion"
// Aquí viven TODAS las consultas SQL. Esta capa solo habla con
// PostgreSQL: no valida datos ni decide códigos HTTP (eso lo
// hace el controlador).
// Se usan consultas parametrizadas ($1, $2...) para evitar
// inyección SQL.
// =========================================================

import pool from '../config/db.js';

// Columnas que devuelve la API en cada consulta
const COLUMNAS =
  'id_tipo_habitacion, nombre, descripcion, capacidad, precio_noche';

// Campos que se permiten actualizar (whitelist de seguridad)
const CAMPOS_PERMITIDOS = ['nombre', 'descripcion', 'capacidad', 'precio_noche'];

// ---------------------------------------------------------
// SELECT - listar todos los tipos de habitación
// ---------------------------------------------------------
const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM tipos_habitacion
     ORDER BY id_tipo_habitacion ASC`
  );
  return rows;
};

// ---------------------------------------------------------
// SELECT - buscar un tipo por su ID (devuelve undefined si no existe)
// ---------------------------------------------------------
const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM tipos_habitacion
     WHERE id_tipo_habitacion = $1`,
    [id]
  );
  return rows[0];
};

// ---------------------------------------------------------
// INSERT - crear un tipo de habitación y devolver la fila creada
// ---------------------------------------------------------
const crear = async ({ nombre, descripcion, capacidad, precio_noche }) => {
  const { rows } = await pool.query(
    `INSERT INTO tipos_habitacion (nombre, descripcion, capacidad, precio_noche)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS}`,
    [nombre, descripcion, capacidad, precio_noche]
  );
  return rows[0];
};

// ---------------------------------------------------------
// UPDATE - actualizar solo los campos enviados.
// Devuelve la fila actualizada o undefined si el ID no existe.
// ---------------------------------------------------------
const actualizar = async (id, datos) => {
  // Se construye el SET dinámicamente solo con campos permitidos
  const campos = CAMPOS_PERMITIDOS.filter(
    (campo) => datos[campo] !== undefined
  );

  // Nada que actualizar: se evita generar un SQL inválido
  if (campos.length === 0) return undefined;

  const valores = [];
  const sets = campos.map((campo, i) => {
    valores.push(datos[campo]);
    return `${campo} = $${i + 1}`;
  });

  valores.push(id); // el ID siempre queda como último parámetro

  const { rows } = await pool.query(
    `UPDATE tipos_habitacion
     SET ${sets.join(', ')}
     WHERE id_tipo_habitacion = $${valores.length}
     RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0];
};

// ---------------------------------------------------------
// DELETE - eliminar un tipo. Devuelve true si borró una fila.
// ---------------------------------------------------------
const eliminar = async (id) => {
  const result = await pool.query(
    'DELETE FROM tipos_habitacion WHERE id_tipo_habitacion = $1',
    [id]
  );
  return result.rowCount > 0;
};

export default {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
