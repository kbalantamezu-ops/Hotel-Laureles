"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESOURCES, RESOURCE_TITLES } from "../../lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", key: "dashboard" },
  { href: "/tipos-habitacion", label: "Tipos de habitación", key: "tiposHabitacion" },
  { href: "/habitaciones", label: "Habitaciones", key: "habitaciones" },
  { href: "/reservas", label: "Reservas", key: "reservas" },
  { href: "/clientes", label: "Clientes", key: "clientes" },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col border-r border-zinc-800 bg-[#111827]">
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
            <div className="text-sm font-semibold tracking-wide uppercase text-zinc-400">
              Hotel
            </div>
            <div className="text-base font-semibold text-white">Los Laureles</div>
          </div>
        </div>

        <div className="px-3 py-2">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === "dashboard"
                ? pathname === "/"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white ${
                    isActive
                      ? "bg-amber-400/10 text-amber-400 border-l-2 border-amber-400 pl-[9px]"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-5 py-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
            Frontend · Next.js + Tailwind CSS
          </div>
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Encabezado de la sección (breadcrumb simple) */}
          <header className="shrink-0 border-b border-zinc-800 bg-[#0f172a] px-6 py-3">
            <div className="flex items-center justify-between text-sm">
              <PageTitle pathname={pathname} />
              <ApiStatus />
            </div>
          </header>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-auto px-6 py-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function PageTitle({ pathname }) {
  const titles = {
    "/": "Área de trabajo",
    "/tipos-habitacion": "Tipos de habitación",
    "/habitaciones": "Habitaciones",
    "/reservas": "Reservas",
    "/clientes": "Clientes",
  };

  // Detectar ruta de recurso con ID o subruta
  let label = titles[pathname];
  if (!label) {
    for (const href of Object.values(RESOURCES)) {
      if (pathname.startsWith(`/${href}`)) {
        label = RESOURCE_TITLES[href in RESOURCE_TITLES ? href : ""] || href;
        break;
      }
    }
  }
  if (!label) label = "Panel";

  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <span className="h-6 w-6 flex items-center justify-center rounded border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-400">
        Panel
      </span>
      <span className="text-white font-medium">{label}</span>
    </div>
  );
}

function ApiStatus() {
  return (
    <ApiStatusClient />
  );
}

function ApiStatusClient() {
  return null;
}
