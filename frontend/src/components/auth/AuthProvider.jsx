"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveSession,
  saveUser,
} from "@/lib/authStorage";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar: validar la sesión guardada contra /auth/me.
  // Si el access expiró, apiFetch intenta refrescar automáticamente.
  useEffect(() => {
    let cancelado = false;

    const iniciar = async () => {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      const cache = getStoredUser();

      if (cache && !cancelado) setUsuario(cache);

      if (!access && !refresh) {
        if (!cancelado) {
          setUsuario(null);
          setCargando(false);
        }
        return;
      }

      try {
        const data = await api.auth.me();
        if (!cancelado) {
          setUsuario(data.usuario);
          saveUser(data.usuario);
        }
      } catch (err) {
        // Solo se cierra la sesión si el problema es de autenticación.
        // Un fallo de red no debe borrar credenciales válidas.
        const esProblemaDeSesion =
          err?.status === 401 ||
          err?.status === 403 ||
          err?.code === "SESSION_EXPIRED";

        if (!cancelado && esProblemaDeSesion) {
          clearSession();
          setUsuario(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    iniciar();

    const alExpirar = () => {
      setUsuario(null);
      setCargando(false);
    };

    window.addEventListener("hl:session-expired", alExpirar);

    return () => {
      cancelado = true;
      window.removeEventListener("hl:session-expired", alExpirar);
    };
  }, []);

  const login = useCallback(async (identificador, password) => {
    const data = await api.auth.login({ identificador, password });

    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      usuario: data.usuario,
    });

    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  const logout = useCallback(async () => {
    // El backend es stateless; el cierre real es local.
    try {
      await api.auth.logout();
    } catch (_err) {
      // Se ignora: aunque falle la red, la sesión local debe borrarse.
    }

    clearSession();
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      estaAutenticado: Boolean(usuario),
      login,
      logout,
      tieneRol: (...roles) => Boolean(usuario && roles.includes(usuario.rol)),
    }),
    [usuario, cargando, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return contexto;
}
