// =========================================================
// CAPA MODELO - tabla "reservas"
// Aquí viven TODAS las consultas SQL. Esta capa solo habla con
// PostgreSQL: no valida datos ni decide códigos HTTP (eso lo
// hace el controlador).
// Se usan consultas parametrizadas ($1, $2...) para evitar
// inyección SQL.
// =========================================================

import pool from '../config/db.js';

// Columnas que devuelve la API en cada consulta
// (fecha_reserva la genera la BD con CURRENT_TIMESTAMP)
const COLUMNAS =
  'id_reserva, id_cliente, id_habitacion, fecha_reserva, fecha_entrada, ' +
  'fecha_salida, cantidad_huespedes, estado, observaciones, total';

// Campos que se permiten actualizar (whitelist de seguridad)
const CAMPOS_PERMITIDOS = [
  'id_cliente',
  'id_habitacion',
  'fecha_entrada',
  'fecha_salida',
  'cantidad_huespedes',
  'estado',
  'observaciones',
  'total',
];

// ---------------------------------------------------------
// SELECT - listar todas las reservas
// ---------------------------------------------------------
const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM reservas
     ORDER BY id_reserva ASC`
  );
  return rows;
};

// ---------------------------------------------------------
// SELECT - buscar una reserva por su ID (devuelve undefined si no existe)
// ---------------------------------------------------------
const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS}
     FROM reservas
     WHERE id_reserva = $1`,
    [id]
  );
  return rows[0];
};

// ---------------------------------------------------------
// INSERT - crear una reserva y devolver la fila creada.
// fecha_reserva no se envía: la genera la BD (DEFAULT CURRENT_TIMESTAMP).
// ---------------------------------------------------------
const crear = async ({
  id_cliente,
  id_habitacion,
  fecha_entrada,
  fecha_salida,
  cantidad_huespedes,
  estado,
  observaciones,
  total,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO reservas
       (id_cliente, id_habitacion, fecha_entrada, fecha_salida,
        cantidad_huespedes, estado, observaciones, total)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${COLUMNAS}`,
    [
      id_cliente,
      id_habitacion,
      fecha_entrada,
      fecha_salida,
      cantidad_huespedes,
      estado,
      observaciones,
      total,
    ]
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
    `UPDATE reservas
     SET ${sets.join(', ')}
     WHERE id_reserva = $${valores.length}
     RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0];
};

// ---------------------------------------------------------
// DELETE - eliminar una reserva. Devuelve true si borró una fila.
// ---------------------------------------------------------
const eliminar = async (id) => {
  const result = await pool.query(
    'DELETE FROM reservas WHERE id_reserva = $1',
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
