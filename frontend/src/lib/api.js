/**
 * api.js
 * ---------------------------------------------------------
 * Capa centralizada de comunicación con la API REST del backend.
 *
 * Reglas de uso:
 * - El frontend lee NEXT_PUBLIC_API_URL desde las variables de entorno del
 *   navegador (debe empezar por NEXT_PUBLIC_).
 * - Este módulo construye las URLs ytransforma las respuestas de fetch en JSON,
 *   lanzando errores cuando el backend responde con 4xx/5xx para que la UI
 *   pueda mostrar alertas de éxito/error.
 *
 * Formato de respuesta esperado del backend:
 * - Éxito: JSON directo (lista u objeto) o wrapper con mensaje + recurso.
 * - Error: { mensaje, errores? }
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Construye la URL completa para un path relativo de la API.
 * @param {string} path - path relativo, ej "/tipos-habitacion"
 * @returns {string}
 */
export function apiUrl(path) {
  const base = BASE_URL.replace(/\/+$/, "");
  const relative = path.replace(/^\/+/, "");
  return `${base}/${relative}`;
}

/**
 * Función base para todas las peticiones.
 * - Automáticamente parsea JSON.
 * - Lanza Error si la respuesta no es ok, propagando el mensaje del backend
 *   cuando esté disponible.
 */
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error(`No se pudo conectar con la API: ${err.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (_err) {
    // Algunos endpoints podrían no devolver JSON en casos muy raros.
    throw new Error("Respuesta inesperada del servidor.");
  }

  if (!response.ok) {
    // El backend suele devolver { mensaje, errores? }
    const mensaje =
      data && typeof data.mensaje === "string"
        ? data.mensaje
        : `Error en la petición (${response.status}).`;

    const errores =
      Array.isArray(data?.errores) && data.errores.length
        ? data.errores
        : undefined;

    const error = new Error(mensaje);
    error.status = response.status;
    error.data = data;
    error.errors = errores;
    throw error;
  }

  return data;
}

// ---------------------------------------------------------
// Helpers por recurso (opcionales, para evitar repetir paths)
// ---------------------------------------------------------

export const api = {
  /** GET /api/health */
  async health() {
    return apiFetch("/health");
  },

  /** Tipos de habitación */
  tiposHabitacion: {
    lista: () => apiFetch("/tipos-habitacion"),
    porId: (id) => apiFetch(`/tipos-habitacion/${id}`),
    crear: (body) => apiFetch("/tipos-habitacion", { method: "POST", body }),
    actualizar: (id, body) => apiFetch(`/tipos-habitacion/${id}`, {
      method: "PUT",
      body,
    }),
    eliminar: (id) => apiFetch(`/tipos-habitacion/${id}`, {
      method: "DELETE",
    }),
  },

  /** Habitaciones */
  habitaciones: {
    lista: () => apiFetch("/habitaciones"),
    porId: (id) => apiFetch(`/habitaciones/${id}`),
    crear: (body) => apiFetch("/habitaciones", { method: "POST", body }),
    actualizar: (id, body) => apiFetch(`/habitaciones/${id}`, {
      method: "PUT",
      body,
    }),
    eliminar: (id) => apiFetch(`/habitaciones/${id}`, { method: "DELETE" }),
  },

  /** Reservas */
  reservas: {
    lista: () => apiFetch("/reservas"),
    porId: (id) => apiFetch(`/reservas/${id}`),
    crear: (body) => apiFetch("/reservas", { method: "POST", body }),
    actualizar: (id, body) => apiFetch(`/reservas/${id}`, {
      method: "PUT",
      body,
    }),
    eliminar: (id) => apiFetch(`/reservas/${id}`, { method: "DELETE" }),
  },

  /** Clientes */
  clientes: {
    lista: () => apiFetch("/clientes"),
    porId: (id) => apiFetch(`/clientes/${id}`),
    crear: (body) => apiFetch("/clientes", { method: "POST", body }),
    actualizar: (id, body) => apiFetch(`/clientes/${id}`, {
      method: "PUT",
      body,
    }),
    eliminar: (id) => apiFetch(`/clientes/${id}`, { method: "DELETE" }),
  },
};

export default api;
