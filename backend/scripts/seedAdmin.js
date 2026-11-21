// =========================================================
// Seed del primer usuario administrador.
//
// Uso:
//   1. Definir SEED_ADMIN_NOMBRE, SEED_ADMIN_CORREO y
//      SEED_ADMIN_PASSWORD en backend/.env
//   2. Ejecutar: npm run seed:admin
//
// Es idempotente: si el usuario ya existe, no crea nada.
// =========================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const ejecutar = async () => {
  const nombreUsuario = process.env.SEED_ADMIN_NOMBRE || 'admin';
  const correo = process.env.SEED_ADMIN_CORREO || 'admin@hotel.local';
  const password = process.env.SEED_ADMIN_PASSWORD;
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;

  if (!password) {
    throw new Error(
      'Define SEED_ADMIN_PASSWORD en backend/.env antes de ejecutar el seed.'
    );
  }

  const { rows: roles } = await pool.query(
    `SELECT id_rol FROM roles WHERE lower(nombre) = lower($1) LIMIT 1`,
    ['Administrador']
  );
  if (roles.length === 0) {
    throw new Error(
      'No existe el rol "Administrador". Ejecuta primero el script de base de datos.'
    );
  }

  const { rows: existentes } = await pool.query(
    `SELECT id_usuario
     FROM usuarios
     WHERE lower(correo) = lower($1) OR lower(nombre_usuario) = lower($2)
     LIMIT 1`,
    [correo, nombreUsuario]
  );
  if (existentes.length > 0) {
    console.log(
      `[seed] El usuario "${nombreUsuario}" (${correo}) ya existe. No se creó nada.`
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, rounds);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre_usuario, correo, password_hash, estado)
     VALUES ($1, $2, $3, $4, 'ACTIVO')
     RETURNING id_usuario, nombre_usuario, correo, estado`,
    [roles[0].id_rol, nombreUsuario, correo, passwordHash]
  );

  console.log('[seed] Administrador creado correctamente:', rows[0]);
};

ejecutar()
  .catch((err) => {
    console.error('[seed] Error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
