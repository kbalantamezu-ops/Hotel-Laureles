// Modelo de la tabla refresh_tokens.
// Solo se guarda el hash SHA-256 del token, nunca el token en claro.
import pool from '../config/db.js';

const crear = async ({ id_usuario, token_hash, expira_en }) => {
  const { rows } = await pool.query(
    `INSERT INTO refresh_tokens (id_usuario, token_hash, expira_en)
     VALUES ($1, $2, $3)
     RETURNING id_refresh_token, id_usuario, expira_en, revocado, fecha_creacion`,
    [id_usuario, token_hash, expira_en]
  );
  return rows[0];
};

const buscarVigente = async (token_hash) => {
  const { rows } = await pool.query(
    `SELECT id_refresh_token, id_usuario, expira_en, revocado
     FROM refresh_tokens
     WHERE token_hash = $1
       AND revocado = FALSE
       AND expira_en > NOW()
     LIMIT 1`,
    [token_hash]
  );
  return rows[0];
};

// Consume el refresh token de forma atómica: lo marca revocado y devuelve el
// usuario solo si seguía vigente. Evita que dos peticiones simultáneas
// puedan canjear el mismo refresh token.
const consumir = async (token_hash) => {
  const { rows } = await pool.query(
    `UPDATE refresh_tokens
     SET revocado = TRUE
     WHERE token_hash = $1
       AND revocado = FALSE
       AND expira_en > NOW()
     RETURNING id_usuario`,
    [token_hash]
  );
  return rows[0];
};

const revocar = async (token_hash) => {
  const resultado = await pool.query(
    `UPDATE refresh_tokens
     SET revocado = TRUE
     WHERE token_hash = $1 AND revocado = FALSE`,
    [token_hash]
  );
  return resultado.rowCount > 0;
};

const revocarTodosDeUsuario = async (id_usuario) => {
  const resultado = await pool.query(
    `UPDATE refresh_tokens
     SET revocado = TRUE
     WHERE id_usuario = $1 AND revocado = FALSE`,
    [id_usuario]
  );
  return resultado.rowCount;
};

export default { crear, buscarVigente, consumir, revocar, revocarTodosDeUsuario };
