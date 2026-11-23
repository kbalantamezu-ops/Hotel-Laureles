// =========================================================
// ROLES DEL SISTEMA EN EL FRONTEND
// Deben coincidir con la columna roles.nombre del backend.
// =========================================================

export const ROLES = {
  ADMINISTRADOR: "Administrador",
  RECEPCIONISTA: "Recepcionista",
  CLIENTE: "Cliente",
};

export const ROLE_OPTIONS = [
  {
    value: ROLES.ADMINISTRADOR,
    label: "Administrador",
    description: "Gestión de usuarios, habitaciones y supervisión general.",
  },
  {
    value: ROLES.RECEPCIONISTA,
    label: "Recepcionista",
    description: "Reservas, clientes, check-in y check-out.",
  },
  {
    value: ROLES.CLIENTE,
    label: "Cliente",
    description: "Consulta de habitaciones y sus propias reservas.",
  },
];

export const ROLE_BADGE_CLASSES = {
  [ROLES.ADMINISTRADOR]: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  [ROLES.RECEPCIONISTA]: "bg-sky-500/10 text-sky-300 border-sky-500/25",
  [ROLES.CLIENTE]: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
};

export function esAdmin(rol) {
  return rol === ROLES.ADMINISTRADOR;
}

export function esRecepcionista(rol) {
  return rol === ROLES.RECEPCIONISTA;
}

export function esCliente(rol) {
  return rol === ROLES.CLIENTE;
}
