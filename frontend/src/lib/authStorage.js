// =========================================================
// ALMACENAMIENTO DE SESIÓN (navegador)
// ---------------------------------------------------------
// El access token vive solo en memoria. El refresh token permite
// recuperar la sesión después de recargar la página.
// =========================================================

const KEYS = {
  refreshToken: "hl.refreshToken",
  usuario: "hl.usuario",
};

let accessTokenEnMemoria = null;

export function isBrowser() {
  return typeof window !== "undefined";
}

function leer(key) {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (_err) {
    return null;
  }
}

function escribir(key, value) {
  if (!isBrowser()) return;
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch (_err) {
    // localStorage puede estar deshabilitado; se ignora.
  }
}

export function getAccessToken() {
  return accessTokenEnMemoria;
}

export function getRefreshToken() {
  return leer(KEYS.refreshToken);
}

export function getStoredUser() {
  const raw = leer(KEYS.usuario);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

export function saveUser(usuario) {
  escribir(KEYS.usuario, usuario ? JSON.stringify(usuario) : null);
}

export function saveTokens({ accessToken, refreshToken, usuario }) {
  if (accessToken !== undefined) {
    accessTokenEnMemoria = accessToken || null;
    if (isBrowser()) window.dispatchEvent(new CustomEvent("hl:access-token-updated", { detail: accessTokenEnMemoria }));
  }
  if (refreshToken) escribir(KEYS.refreshToken, refreshToken);
  if (usuario) saveUser(usuario);
}

export function saveSession({ accessToken, refreshToken, usuario }) {
  saveTokens({ accessToken, refreshToken });
  saveUser(usuario);
}

export function clearSession() {
  accessTokenEnMemoria = null;
  if (isBrowser()) {
    escribir("hl.accessToken", null);
    window.dispatchEvent(new CustomEvent("hl:access-token-updated", { detail: null }));
  }
  escribir(KEYS.refreshToken, null);
  escribir(KEYS.usuario, null);
}

// Elimina el access token guardado por versiones anteriores de la app.
if (isBrowser()) escribir("hl.accessToken", null);

export const SESSION_KEYS = KEYS;
