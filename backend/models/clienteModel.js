import pool from '../config/db.js';

const COLUMNAS =
  'id_cliente, id_usuario, documento, telefono, direccion, fecha_nacimiento';
const CAMPOS_PERMITIDOS = [
  'id_usuario',
  'documento',
  'telefono',
  'direccion',
  'fecha_nacimiento',
];

const obtenerTodos = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM clientes ORDER BY id_cliente ASC`
  );
  return rows;
};

const obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM clientes WHERE id_cliente = $1`,
    [id]
  );
  return rows[0];
};

const crear = async ({
  id_usuario,
  documento,
  telefono,
  direccion,
  fecha_nacimiento,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO clientes
       (id_usuario, documento, telefono, direccion, fecha_nacimiento)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNAS}`,
    [id_usuario, documento, telefono, direccion, fecha_nacimiento]
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
    `UPDATE clientes SET ${sets.join(', ')}
     WHERE id_cliente = $${valores.length}
     RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    'DELETE FROM clientes WHERE id_cliente = $1',
    [id]
  );
  return result.rowCount > 0;
};

export default { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
