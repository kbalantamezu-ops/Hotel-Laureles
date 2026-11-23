// =========================================================
// ROLES DEL SISTEMA
// Los nombres deben coincidir EXACTAMENTE con los registros
// insertados en la tabla "roles" del script de la base de datos.
// =========================================================

export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  CLIENTE: 'Cliente',
};

// Estados permitidos para la columna usuarios.estado
export const ESTADOS_USUARIO = ['ACTIVO', 'INACTIVO'];

// Lista de roles para selects y validaciones
export const LISTA_ROLES = Object.values(ROLES);

export default { ROLES, ESTADOS_USUARIO, LISTA_ROLES };
