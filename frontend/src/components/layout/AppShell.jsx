"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";
import RequireAuth from "../auth/RequireAuth";
import { ROLES } from "@/lib/roles";

const RUTAS_PUBLICAS = ["/login", "/403"];

/**
 * Define los roles permitidos por prefijo de ruta.
 * null = cualquier usuario autenticado.
 */
function rolesParaRuta(pathname) {
  if (pathname.startsWith("/usuarios")) return [ROLES.ADMINISTRADOR];
  if (pathname.startsWith("/tipos-habitacion")) return [ROLES.ADMINISTRADOR];

  if (pathname.startsWith("/recepcion")) return [ROLES.RECEPCIONISTA];
  if (pathname === "/mis-reservas" || pathname.startsWith("/mis-reservas/")) {
    return [ROLES.CLIENTE];
  }

  if (pathname.startsWith("/reservas")) {
    return [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA];
  }
  if (pathname.startsWith("/clientes")) {
    return [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA];
  }
  if (pathname.startsWith("/habitaciones")) {
    // Editar habitaciones es exclusivo del Administrador.
    if (pathname.endsWith("/editar")) return [ROLES.ADMINISTRADOR];
    return [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA];
  }

  return null;
}

export default function AppShell({ children }) {
  const pathname = usePathname();

  if (RUTAS_PUBLICAS.includes(pathname)) {
    return children;
  }

  return (
    <RequireAuth roles={rolesParaRuta(pathname)}>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  );
}
