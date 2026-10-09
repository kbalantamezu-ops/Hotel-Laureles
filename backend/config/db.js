// Configuración de la base de datos de PostgreSQL
// La conexión se realiza mediante la variable de entorno DATABASE_URL.
// Funciona con PostgreSQL local (postgres://...) y con proveedores en la nube
// (Neon, Railway, Render, DigitalOcean, etc.) usando la misma URL de conexión.

import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    '[db] WARN: DATABASE_URL no está definida. Usando conexión por defecto '
  + 'postgres://localhost:5432/hotel_laureles. '
  + 'Crea un archivo .env con DATABASE_URL=postgres://usuario:contrasena@localhost:5432/hotel_laureles'
  );
}

const pool = new Pool({
  connectionString: databaseUrl || 'postgres://localhost:5432/hotel_laureles',
  // Parámetros opcionales que se pueden añadir según el proveedor de PostgreSQL
  // ssl: process.env.DATABASE_SSL === 'true',
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  // max: 20,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 2000,
});

// Comprobación básica de la conexión en arranque
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW() AS now');
    console.log('[db] Conexión a PostgreSQL correcta');
    client.release();
  } catch (err) {
    console.error('[db] Error conectando a PostgreSQL:', err.message);
    // En modo desarrollo se deja el proceso continuar; en producción es
    // conveniente detener el servidor si no se puede conectar a la BD.
  }
}

// Al cerrar el proceso, liberar el pool
process.on('SIGTERM', () => {
  console.log('[db] Cerrando pool de PostgreSQL...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[db] Cerrando pool de PostgreSQL...');
  pool.end();
  process.exit(0);
});

export { pool, testConnection };

// Exportación por defecto para importar de forma directa
export default pool;
