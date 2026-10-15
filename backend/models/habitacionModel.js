// Modelo para las consultas SQL de la tabla habitaciones.
import pool from '../config/db.js';

const COLUMNAS =
  'id_habitacion, id_tipo_habitacion, numero, piso, estado, descripcion';
const CAMPOS_PERMITIDOS = [
  'id_tipo_habitacion',
  'numero',
  'piso',
  'estado',
  'descripcion',
];

const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM habitaciones ORDER BY id_habitacion ASC`
  );
  return rows;
};

const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM habitaciones WHERE id_habitacion = $1`,
    [id]
  );
  return rows[0];
};

const crear = async ({
  id_tipo_habitacion,
  numero,
  piso,
  estado,
  descripcion,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO habitaciones
       (id_tipo_habitacion, numero, piso, estado, descripcion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNAS}`,
    [id_tipo_habitacion, numero, piso, estado, descripcion]
  );
  return rows[0];
};

const actualizar = async (id, datos) => {
  const campos = CAMPOS_PERMITIDOS.filter(
    (campo) => datos[campo] !== undefined
  );
  if (campos.length === 0) return undefined;

  const valores = [];
  const sets = campos.map((campo, indice) => {
    valores.push(datos[campo]);
    return `${campo} = $${indice + 1}`;
  });
  valores.push(id);

  const { rows } = await pool.query(
    `UPDATE habitaciones SET ${sets.join(', ')}
     WHERE id_habitacion = $${valores.length}
     RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    'DELETE FROM habitaciones WHERE id_habitacion = $1',
    [id]
  );
  return result.rowCount > 0;
};

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
