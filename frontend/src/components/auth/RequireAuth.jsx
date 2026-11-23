"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import PageLoader from "../ui/PageLoader";

/**
 * Guard de autenticación y roles.
 *
 * - Sin sesión -> /login?redirect=<ruta actual>
 * - Autenticado sin el rol requerido -> /403
 * - Mientras se valida la sesión -> loader
 *
 * La autorización real SIEMPRE la aplica el backend; este guard
 * solo controla la experiencia de navegación.
 */
export default function RequireAuth({ children, roles = null }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const sinPermiso =
    Boolean(usuario) &&
    Array.isArray(roles) &&
    roles.length > 0 &&
    !roles.includes(usuario.rol);

  useEffect(() => {
    if (cargando) return;

    if (!usuario) {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const destino = `${pathname}${search}`;
      router.replace(`/login?redirect=${encodeURIComponent(destino)}`);
      return;
    }

    if (sinPermiso) {
      router.replace("/403");
    }
  }, [cargando, usuario, sinPermiso, pathname, router]);

  if (cargando || !usuario || sinPermiso) {
    return <PageLoader label="Verificando sesión..." />;
  }

  return children;
}
