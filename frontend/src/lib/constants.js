/**
 * constants.js
 * ---------------------------------------------------------
 * Constantes compartidas para el frontend del panel administrativo.
 * Sirve para no repetir rutas, slug de recurso, mensajes y formatos
 * en varios componentes.
 */

/**
 * Slug / ruta base por recurso (sin el prefijo /api).
 * Son los mismos nombres que usa el backend en las rutas montadas.
 */
export const RESOURCES = {
  tiposHabitacion: "tipos-habitacion",
  habitaciones: "habitaciones",
  reservas: "reservas",
  clientes: "clientes",
};

/**
 * Título legible por recurso (para encabezados y breadcrumbs).
 */
export const RESOURCE_TITLES = {
  tiposHabitacion: "Tipos de habitación",
  habitaciones: "Habitaciones",
  reservas: "Reservas",
  clientes: "Clientes",
};

/**
 * Mensajes genéricos de la UI.
 */
export const UI = {
  loading: "Cargando...",
  errorCarga: "No se pudieron cargar los datos.",
  errorDesconocido: "Ocurrió un error inesperado.",
  confirmarEliminar:
    "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.",
  successCreado: "Registro creado correctamente.",
  successActualizado: "Registro actualizado correctamente.",
  successEliminado: "Registro eliminado correctamente.",
};

/**
 * Formato de fecha esperado por el backend para fechas.
 * El backend valida YYYY-MM-DD en reservas y otros campos de fecha.
 */
export const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Devuelve un placeholder de fecha local en formato YYYY-MM-DD.
 * Útil como valor inicial en inputs type="date".
 */
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Opciones de estado usadas en varios recursos del backend.
 * Se pueden ampliar por recurso si el backend las define.
 */
export const ESTADOS_GENERICOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "CHECKIN", label: "Check-in" },
  { value: "CHECKOUT", label: "Check-out" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "OCUPADA", label: "Ocupada" },
  { value: "Mantenimiento", label: "Mantenimiento" },
];
