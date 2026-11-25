import pool from '../config/db.js';

async function reservaPorId(idReserva) {
  const { rows } = await pool.query(
    `SELECT r.id_reserva, r.estado, c.id_usuario
     FROM reservas r JOIN clientes c ON c.id_cliente=r.id_cliente
     WHERE r.id_reserva=$1`, [idReserva]
  );
  return rows[0];
}

async function listar(idReserva) {
  const { rows } = await pool.query(
    `SELECT h.id_huesped, h.nombres, h.apellidos, h.documento,
       h.telefono, h.correo, h.nacionalidad, rh.es_principal
     FROM reserva_huespedes rh JOIN huespedes h ON h.id_huesped=rh.id_huesped
     WHERE rh.id_reserva=$1 ORDER BY rh.es_principal DESC, h.apellidos, h.nombres`,
    [idReserva]
  );
  return rows;
}

async function agregar(idReserva, datos) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { rows: reservaRows } = await db.query(
      'SELECT estado FROM reservas WHERE id_reserva=$1 FOR UPDATE', [idReserva]
    );
    const reserva = reservaRows[0];
    if (!reserva) { const error = new Error('La reserva no existe.'); error.code = 'RESERVA_NO_EXISTE'; throw error; }
    if (['CANCELADA', 'FINALIZADA'].includes(reserva.estado)) {
      const error = new Error('No se pueden agregar acompañantes a una reserva cancelada o finalizada.');
      error.code = 'RESERVA_CERRADA'; throw error;
    }
    const { rows } = await db.query(
      `INSERT INTO huespedes (nombres, apellidos, documento, telefono, correo, nacionalidad)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_huesped`,
      [datos.nombres.trim(), datos.apellidos.trim(), datos.documento.trim(),
        datos.telefono?.trim() || null, datos.correo?.trim() || null,
        datos.nacionalidad?.trim() || null]
    );
    const idHuesped = rows[0].id_huesped;
    await db.query(
      'INSERT INTO reserva_huespedes (id_reserva,id_huesped,es_principal) VALUES ($1,$2,FALSE)',
      [idReserva, idHuesped]
    );
    await db.query('COMMIT');
    return { id_huesped: idHuesped, ...datos };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally { db.release(); }
}

async function eliminar(idReserva, idHuesped) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const { rowCount } = await db.query(
      'DELETE FROM reserva_huespedes WHERE id_reserva=$1 AND id_huesped=$2 AND es_principal=FALSE',
      [idReserva, idHuesped]
    );
    if (!rowCount) { await db.query('ROLLBACK'); return false; }
    await db.query(
      `DELETE FROM huespedes h WHERE h.id_huesped=$1
       AND NOT EXISTS (SELECT 1 FROM reserva_huespedes rh WHERE rh.id_huesped=h.id_huesped)`,
      [idHuesped]
    );
    await db.query('COMMIT');
    return true;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally { db.release(); }
}

export default { reservaPorId, listar, agregar, eliminar };
