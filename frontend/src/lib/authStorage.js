// =========================================================
// ALMACENAMIENTO DE SESIÓN (navegador)
// ---------------------------------------------------------
// Decisión de diseño: los tokens se guardan en localStorage
// porque el cliente HTTP debe poder adjuntarlos y el logout
// debe borrarlos localmente. Esto es adecuado para el alcance
// académico, pero conviene documentar el riesgo de XSS.
// =========================================================

const KEYS = {
  accessToken: "hl.accessToken",
  refreshToken: "hl.refreshToken",
  usuario: "hl.usuario",
};

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
  return leer(KEYS.accessToken);
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
  if (accessToken) escribir(KEYS.accessToken, accessToken);
  if (refreshToken) escribir(KEYS.refreshToken, refreshToken);
  if (usuario) saveUser(usuario);
}

export function saveSession({ accessToken, refreshToken, usuario }) {
  saveTokens({ accessToken, refreshToken });
  saveUser(usuario);
}

export function clearSession() {
  escribir(KEYS.accessToken, null);
  escribir(KEYS.refreshToken, null);
  escribir(KEYS.usuario, null);
}

export const SESSION_KEYS = KEYS;
