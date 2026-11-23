"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "@/lib/roles";
import RolBadge from "../usuarios/RolBadge";
import Button from "../ui/Button";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    key: "dashboard",
    roles: null,
  },
  {
    href: "/usuarios",
    label: "Usuarios",
    key: "usuarios",
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    href: "/tipos-habitacion",
    label: "Tipos de habitación",
    key: "tiposHabitacion",
    roles: [ROLES.ADMINISTRADOR],
  },
  {
    href: "/habitaciones",
    label: "Habitaciones",
    key: "habitaciones",
    roles: [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA],
  },
  {
    href: "/reservas",
    label: "Reservas",
    key: "reservas",
    roles: [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA],
  },
  {
    href: "/clientes",
    label: "Clientes",
    key: "clientes",
    roles: [ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA],
  },
  {
    href: "/mis-reservas",
    label: "Mis reservas",
    key: "misReservas",
    roles: [ROLES.CLIENTE],
  },
  {
    href: "/recepcion/check-in",
    label: "Check-in",
    key: "checkin",
    roles: [ROLES.RECEPCIONISTA],
  },
  {
    href: "/recepcion/check-out",
    label: "Check-out",
    key: "checkout",
    roles: [ROLES.RECEPCIONISTA],
  },
];

const TITULOS = {
  "/": "Área de trabajo",
  "/usuarios": "Gestión de usuarios",
  "/tipos-habitacion": "Tipos de habitación",
  "/habitaciones": "Habitaciones",
  "/reservas": "Reservas",
  "/clientes": "Clientes",
  "/mis-reservas": "Mis reservas",
  "/recepcion/check-in": "Check-in",
  "/recepcion/check-out": "Check-out",
  "/403": "Acceso denegado",
};

const PREFIJOS = [
  ["/tipos-habitacion", "Tipos de habitación"],
  ["/habitaciones", "Habitaciones"],
  ["/reservas", "Reservas"],
  ["/clientes", "Clientes"],
  ["/usuarios", "Usuarios"],
  ["/mis-reservas", "Mis reservas"],
  ["/recepcion/check-in", "Check-in"],
  ["/recepcion/check-out", "Check-out"],
];

function tituloDeRuta(pathname) {
  if (TITULOS[pathname]) return TITULOS[pathname];

  const encontrado = PREFIJOS.find(([prefijo]) => pathname.startsWith(prefijo));
  return encontrado ? encontrado[1] : "Panel";
}

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const [saliendo, setSaliendo] = useState(false);

  const itemsVisibles = NAV_ITEMS.filter(
    (item) => !item.roles || (usuario && item.roles.includes(usuario.rol))
  );

  const handleLogout = async () => {
    setSaliendo(true);
    await logout();
    router.replace("/login");
    setSaliendo(false);
  };

  return (
    <div className="flex min-h-0">
      {/* Sidebar */}
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-zinc-800 bg-[#111827]">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Hotel
            </div>
            <div className="text-base font-semibold text-white">Los Laureles</div>
          </div>
        </div>

        <div className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-1 text-sm">
            {itemsVisibles.map((item) => {
              const isActive =
                item.key === "dashboard"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white ${
                    isActive
                      ? "border-l-2 border-amber-400 bg-amber-400/10 pl-[9px] text-amber-400"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Sesión</div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {usuario?.nombre_usuario || "—"}
              </div>
              <div className="truncate text-xs text-zinc-500">
                {usuario?.correo || ""}
              </div>
            </div>
            <RolBadge rol={usuario?.rol} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={handleLogout}
            loading={saliendo}
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-zinc-800 bg-[#0f172a] px-6 py-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <PageTitle pathname={pathname} />
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-zinc-500 sm:inline">
                  {usuario?.rol || ""}
                </span>
                <RolBadge rol={usuario?.rol} />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto px-6 py-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function PageTitle({ pathname }) {
  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-400">
        HL
      </span>
      <span className="font-medium text-white">{tituloDeRuta(pathname)}</span>
    </div>
  );
}
