import pool from '../config/db.js';

const COLUMNAS = `r.id_reserva, r.id_cliente, r.id_habitacion, r.fecha_reserva,
  r.fecha_entrada, r.fecha_salida, r.cantidad_huespedes, r.estado,
  r.observaciones, r.total, h.numero, th.nombre AS tipo_habitacion,
  th.capacidad, th.precio_noche`;

async function clienteDelUsuario(idUsuario, db = pool) {
  const { rows } = await db.query(
    'SELECT id_cliente FROM clientes WHERE id_usuario = $1', [idUsuario]
  );
  return rows[0]?.id_cliente ?? null;
}

async function listarPorUsuario(idUsuario) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM reservas r
     JOIN clientes c ON c.id_cliente = r.id_cliente
     JOIN habitaciones h ON h.id_habitacion = r.id_habitacion
     JOIN tipos_habitacion th ON th.id_tipo_habitacion = h.id_tipo_habitacion
     WHERE c.id_usuario = $1 ORDER BY r.fecha_entrada DESC, r.id_reserva DESC`,
    [idUsuario]
  );
  return rows;
}

async function obtenerPorUsuario(idReserva, idUsuario, db = pool) {
  const { rows } = await db.query(
    `SELECT ${COLUMNAS} FROM reservas r
     JOIN clientes c ON c.id_cliente = r.id_cliente
     JOIN habitaciones h ON h.id_habitacion = r.id_habitacion
     JOIN tipos_habitacion th ON th.id_tipo_habitacion = h.id_tipo_habitacion
     WHERE r.id_reserva = $1 AND c.id_usuario = $2`,
    [idReserva, idUsuario]
  );
  return rows[0];
}

async function propietario(idReserva) {
  const { rows } = await pool.query(
    `SELECT c.id_usuario FROM reservas r JOIN clientes c ON c.id_cliente=r.id_cliente
     WHERE r.id_reserva=$1`, [idReserva]
  );
  return rows[0]?.id_usuario ?? null;
}

async function habitacionDisponible(db, idHabitacion, entrada, salida, cantidad, excluirId = null) {
  const { rows } = await db.query(
    `SELECT h.id_habitacion, h.estado, th.capacidad, th.precio_noche
     FROM habitaciones h JOIN tipos_habitacion th
       ON th.id_tipo_habitacion = h.id_tipo_habitacion
     WHERE h.id_habitacion = $1
       AND h.estado = 'DISPONIBLE'
       AND th.capacidad >= $4
       AND NOT EXISTS (
         SELECT 1 FROM reservas r WHERE r.id_habitacion = h.id_habitacion
           AND r.estado NOT IN ('CANCELADA', 'FINALIZADA')
           AND r.fecha_entrada < $3 AND r.fecha_salida > $2
           AND ($5::integer IS NULL OR r.id_reserva <> $5)
       )
     FOR UPDATE OF h`,
    [idHabitacion, entrada, salida, cantidad, excluirId]
  );
  return rows[0];
}

function totalReserva(precioNoche, entrada, salida) {
  const noches = Math.round((Date.parse(`${salida}T00:00:00Z`) - Date.parse(`${entrada}T00:00:00Z`)) / 86400000);
  return (Number(precioNoche) * noches).toFixed(2);
}

async function crear(idUsuario, datos) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const idCliente = await clienteDelUsuario(idUsuario, db);
    if (!idCliente) {
      const error = new Error('El usuario no tiene un perfil de cliente.');
      error.code = 'CLIENTE_NO_EXISTE';
      throw error;
    }
    const habitacion = await habitacionDisponible(
      db, datos.id_habitacion, datos.fecha_entrada, datos.fecha_salida, datos.cantidad_huespedes, null
    );
    if (!habitacion) {
      const error = new Error('La habitación no existe, no está disponible o no tiene capacidad para esa reserva.');
      error.code = 'HABITACION_NO_DISPONIBLE';
      throw error;
    }
    const { rows } = await db.query(
      `INSERT INTO reservas
        (id_cliente, id_habitacion, fecha_entrada, fecha_salida,
         cantidad_huespedes, estado, observaciones, total)
       VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7)
       RETURNING id_reserva, id_cliente, id_habitacion, fecha_reserva,
         fecha_entrada, fecha_salida, cantidad_huespedes, estado, observaciones, total`,
      [idCliente, datos.id_habitacion, datos.fecha_entrada, datos.fecha_salida,
        datos.cantidad_huespedes, datos.observaciones || null,
        totalReserva(habitacion.precio_noche, datos.fecha_entrada, datos.fecha_salida)]
    );
    await db.query('COMMIT');
    return rows[0];
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}

async function actualizar(idReserva, idUsuario, datos) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const actual = await obtenerPorUsuario(idReserva, idUsuario, db);
    if (!actual) {
      await db.query('ROLLBACK');
      return { noEncontrada: true };
    }
    if (actual.estado !== 'PENDIENTE') {
      const error = new Error('Solo se pueden modificar reservas pendientes.');
      error.code = 'RESERVA_NO_MODIFICABLE';
      throw error;
    }

    const entrada = datos.fecha_entrada ?? String(actual.fecha_entrada).slice(0, 10);
    const salida = datos.fecha_salida ?? String(actual.fecha_salida).slice(0, 10);
    const habitacionId = datos.id_habitacion ?? actual.id_habitacion;
    const cantidad = datos.cantidad_huespedes ?? actual.cantidad_huespedes;
    const habitacion = await habitacionDisponible(db, habitacionId, entrada, salida, cantidad, idReserva);
    if (!habitacion) {
      const error = new Error('La habitación no está disponible para las fechas o capacidad indicadas.');
      error.code = 'HABITACION_NO_DISPONIBLE';
      throw error;
    }
    const { rows } = await db.query(
      `UPDATE reservas SET id_habitacion=$1, fecha_entrada=$2, fecha_salida=$3,
         cantidad_huespedes=$4, observaciones=$5, total=$6
       WHERE id_reserva=$7
       RETURNING id_reserva, id_cliente, id_habitacion, fecha_reserva,
         fecha_entrada, fecha_salida, cantidad_huespedes, estado, observaciones, total`,
      [habitacionId, entrada, salida, cantidad,
        datos.observaciones === undefined ? actual.observaciones : datos.observaciones,
        totalReserva(habitacion.precio_noche, entrada, salida), idReserva]
    );
    await db.query('COMMIT');
    return { reserva: rows[0] };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}

async function cancelar(idReserva, idUsuario) {
  const { rows } = await pool.query(
    `UPDATE reservas r SET estado='CANCELADA'
     FROM clientes c WHERE r.id_reserva=$1 AND r.id_cliente=c.id_cliente
       AND c.id_usuario=$2 AND r.estado IN ('PENDIENTE','CONFIRMADA')
     RETURNING r.id_reserva`, [idReserva, idUsuario]
  );
  return rows[0];
}

export default { clienteDelUsuario, listarPorUsuario, obtenerPorUsuario, propietario, crear, actualizar, cancelar };
