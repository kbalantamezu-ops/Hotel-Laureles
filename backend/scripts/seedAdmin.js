// =========================================================
// SEED - Primer usuario Administrador
//
// Uso:
//   npm run seed:admin
//
// Variables requeridas en backend/.env:
//   SEED_ADMIN_USERNAME
//   SEED_ADMIN_EMAIL
//   SEED_ADMIN_PASSWORD
//
// El script es idempotente: si el nombre de usuario ya existe,
// actualiza su rol, correo, contraseña y estado a ACTIVO.
// =========================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { ROLES } from '../config/roles.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

async function main() {
  const nombreUsuario = (process.env.SEED_ADMIN_USERNAME || '').trim();
  const correo = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';

  const faltantes = [];
  if (!nombreUsuario) faltantes.push('SEED_ADMIN_USERNAME');
  if (!correo) faltantes.push('SEED_ADMIN_EMAIL');
  if (!password) faltantes.push('SEED_ADMIN_PASSWORD');

  if (faltantes.length > 0) {
    console.error(
      `[seed] Faltan variables de entorno: ${faltantes.join(', ')}. `
        + 'Defínelas en backend/.env (puedes copiar backend/.env.example).'
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error('[seed] SEED_ADMIN_PASSWORD debe tener al menos 8 caracteres.');
    process.exitCode = 1;
    return;
  }

  // Asegurar que existe el rol Administrador
  let { rows } = await pool.query(
    'SELECT id_rol FROM roles WHERE lower(nombre) = lower($1)',
    [ROLES.ADMINISTRADOR]
  );

  let idRol = rows[0]?.id_rol;

  if (!idRol) {
    const insert = await pool.query(
      `INSERT INTO roles (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING id_rol`,
      [ROLES.ADMINISTRADOR, 'Supervisa el funcionamiento general del sistema']
    );
    idRol = insert.rows[0].id_rol;
    console.log('[seed] Rol Administrador creado.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const resultado = await pool.query(
    `INSERT INTO usuarios (id_rol, nombre_usuario, correo, password_hash, estado)
     VALUES ($1, $2, $3, $4, 'ACTIVO')
     ON CONFLICT (nombre_usuario) DO UPDATE
       SET id_rol = EXCLUDED.id_rol,
           correo = EXCLUDED.correo,
           password_hash = EXCLUDED.password_hash,
           estado = 'ACTIVO'
     RETURNING id_usuario, nombre_usuario, correo, estado`,
    [idRol, nombreUsuario, correo, passwordHash]
  );

  const admin = resultado.rows[0];
  console.log('[seed] Administrador listo:');
  console.log(`       id_usuario: ${admin.id_usuario}`);
  console.log(`       usuario:    ${admin.nombre_usuario}`);
  console.log(`       correo:     ${admin.correo}`);
  console.log(`       estado:     ${admin.estado}`);
  console.log('       contraseña: (definida en SEED_ADMIN_PASSWORD, no se imprime)');
}

main()
  .catch((err) => {
    if (err.code === '23505') {
      console.error(
        '[seed] Ya existe un usuario con ese correo pero con otro nombre de usuario. '
          + 'Cambia SEED_ADMIN_EMAIL o SEED_ADMIN_USERNAME.'
      );
    } else {
      console.error('[seed] Error:', err.message);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
