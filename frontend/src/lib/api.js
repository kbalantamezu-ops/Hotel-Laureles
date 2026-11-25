/**
 * api.js
 * ---------------------------------------------------------
 * Capa centralizada de comunicación con la API REST del backend.
 *
 * Responsabilidades:
 * - Construir la URL base desde NEXT_PUBLIC_API_URL.
 * - Adjuntar automáticamente el access token.
 * - Ante un 401, renovar con el refresh token y reintentar UNA vez.
 * - Si el refresh falla, borrar la sesión y avisar al AuthProvider.
 * - Propagar status/data/errors para que la UI muestre 400/401/403/404.
 *
 * Nunca se reintenta el login ni el refresh para evitar bucles.
 */

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearSession,
} from "./authStorage";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(mensaje, { status = 0, data = null, errors = [], code = null } = {}) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errors = errors;
    this.code = code;
  }
}

/**
 * Construye la URL completa para un path relativo de la API.
 */
export function apiUrl(path) {
  const base = BASE_URL.replace(/\/+$/, "");
  const relative = String(path || "").replace(/^\/+/, "");
  return `${base}/${relative}`;
}

function notificarSesionExpirada() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hl:session-expired"));
  }
}

let refreshPromise = null;

/**
 * Renueva la sesión usando el refresh token.
 * Varias peticiones concurrentes comparten la misma promesa:
 * se hace un solo POST /auth/refresh.
 */
export async function refrescarSesion() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearSession();
      notificarSesionExpirada();
      throw new ApiError("La sesión expiró. Inicie sesión nuevamente.", {
        status: 401,
        code: "SESSION_EXPIRED",
      });
    }

    let response;
    try {
      response = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      throw new ApiError(
        `No se pudo conectar con la API: ${err.message}`,
        { status: 0, code: "NETWORK_ERROR" }
      );
    }

    let data = null;
    try {
      data = await response.json();
    } catch (_err) {
      data = null;
    }

    if (!response.ok || !data?.accessToken) {
      clearSession();
      notificarSesionExpirada();
      throw new ApiError(
        data?.mensaje || "La sesión expiró. Inicie sesión nuevamente.",
        { status: 401, data, code: "SESSION_EXPIRED" }
      );
    }

    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      usuario: data.usuario,
    });

    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function prepararBody(body) {
  if (body === undefined || body === null) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof body === "string" || body instanceof Blob) return body;
  return JSON.stringify(body);
}

async function leerRespuesta(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_err) {
    return { mensaje: text };
  }
}

function construirError(response, data) {
  const mensaje =
    data && typeof data.mensaje === "string"
      ? data.mensaje
      : `Error en la petición (${response.status}).`;

  return new ApiError(mensaje, {
    status: response.status,
    data,
    errors: Array.isArray(data?.errores) ? data.errores : [],
    code: response.status === 401 ? "UNAUTHORIZED" : null,
  });
}

/**
 * Petición base.
 *
 * Opciones extra:
 * - auth: true (por defecto) -> adjunta access token.
 * - skipRefresh: true -> no intenta renovar ante 401.
 */
export async function apiFetch(path, options = {}) {
  const {
    auth = true,
    skipRefresh = false,
    body,
    headers,
    ...rest
  } = options;

  const esFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const token = auth ? getAccessToken() : null;

  const config = {
    ...rest,
    headers: {
      ...(esFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: prepararBody(body),
  };

  let response;
  try {
    response = await fetch(apiUrl(path), config);
  } catch (err) {
    throw new ApiError(`No se pudo conectar con la API: ${err.message}`, {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  // 401 -> renovar y reintentar exactamente una vez.
  if (response.status === 401 && auth && !skipRefresh) {
    try {
      const nuevoAccessToken = await refrescarSesion();

      const reintento = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${nuevoAccessToken}`,
        },
      };

      response = await fetch(apiUrl(path), reintento);
    } catch (refreshErr) {
      // refrescarSesion ya limpió la sesión y notificó al provider.
      throw refreshErr;
    }
  }

  const data = await leerRespuesta(response);

  if (!response.ok) {
    throw construirError(response, data);
  }

  return data;
}

// ---------------------------------------------------------
// Helpers por recurso
// ---------------------------------------------------------

export const api = {
  /** GET /api/health (público) */
  health() {
    return apiFetch("/health", { auth: false, skipRefresh: true });
  },

  auth: {
    login({ identificador, password }) {
      return apiFetch("/auth/login", {
        method: "POST",
        body: { identificador, password },
        auth: false,
        skipRefresh: true,
      });
    },
    me() {
      return apiFetch("/auth/me");
    },
    logout() {
      return apiFetch("/auth/logout", {
        method: "POST",
        body: { refreshToken: getRefreshToken() },
      });
    },
    refresh() {
      return refrescarSesion();
    },
  },

  usuarios: {
    lista: () => apiFetch("/usuarios"),
    porId: (id) => apiFetch(`/usuarios/${id}`),
    crear: (body) => apiFetch("/usuarios", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/usuarios/${id}`, { method: "PUT", body }),
    cambiarRol: (id, body) =>
      apiFetch(`/usuarios/${id}/rol`, { method: "PATCH", body }),
    cambiarPassword: (id, body) =>
      apiFetch(`/usuarios/${id}/password`, { method: "PATCH", body }),
    eliminar: (id) => apiFetch(`/usuarios/${id}`, { method: "DELETE" }),
  },

  roles: {
    lista: () => apiFetch("/roles"),
  },

  /** Tipos de habitación */
  tiposHabitacion: {
    lista: () => apiFetch("/tipos-habitacion"),
    porId: (id) => apiFetch(`/tipos-habitacion/${id}`),
    crear: (body) => apiFetch("/tipos-habitacion", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/tipos-habitacion/${id}`, { method: "PUT", body }),
    eliminar: (id) =>
      apiFetch(`/tipos-habitacion/${id}`, { method: "DELETE" }),
  },

  /** Habitaciones */
  habitaciones: {
    lista: () => apiFetch("/habitaciones"),
    porId: (id) => apiFetch(`/habitaciones/${id}`),
    crear: (body) => apiFetch("/habitaciones", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/habitaciones/${id}`, { method: "PUT", body }),
    eliminar: (id) => apiFetch(`/habitaciones/${id}`, { method: "DELETE" }),
  },

  /** Reservas (gestión general: admin y recepcionista) */
  reservas: {
    lista: () => apiFetch("/reservas"),
    porId: (id) => apiFetch(`/reservas/${id}`),
    crear: (body) => apiFetch("/reservas", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/reservas/${id}`, { method: "PUT", body }),
    eliminar: (id) => apiFetch(`/reservas/${id}`, { method: "DELETE" }),
  },

  /** Clientes */
  clientes: {
    lista: () => apiFetch("/clientes"),
    porId: (id) => apiFetch(`/clientes/${id}`),
    crear: (body) => apiFetch("/clientes", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/clientes/${id}`, { method: "PUT", body }),
    eliminar: (id) => apiFetch(`/clientes/${id}`, { method: "DELETE" }),
  },

  /** Esqueletos de funcionalidades exclusivas (compañeros) */
  misReservas: {
    lista: () => apiFetch("/mis-reservas"),
    porId: (id) => apiFetch(`/mis-reservas/${id}`),
    crear: (body) => apiFetch("/mis-reservas", { method: "POST", body }),
    actualizar: (id, body) =>
      apiFetch(`/mis-reservas/${id}`, { method: "PUT", body }),
    cancelar: (id) => apiFetch(`/mis-reservas/${id}`, { method: "DELETE" }),
    huespedes: {
      lista: (id) => apiFetch(`/reservas/${id}/huespedes`),
      agregar: (id, body) => apiFetch(`/reservas/${id}/huespedes`, { method: "POST", body }),
      eliminar: (id, idHuesped) => apiFetch(`/reservas/${id}/huespedes/${idHuesped}`, { method: "DELETE" }),
    },
  },

  recepcion: {
    checkins: {
      lista: () => apiFetch("/recepcion/checkins"),
      crear: (body) =>
        apiFetch("/recepcion/checkins", { method: "POST", body }),
      porId: (id) => apiFetch(`/recepcion/checkins/${id}`),
    },
    checkouts: {
      lista: () => apiFetch("/recepcion/checkouts"),
      crear: (body) =>
        apiFetch("/recepcion/checkouts", { method: "POST", body }),
      porId: (id) => apiFetch(`/recepcion/checkouts/${id}`),
    },
  },
};

export default api;
