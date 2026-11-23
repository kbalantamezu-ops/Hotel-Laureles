"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { ROLES } from "@/lib/roles";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Alert from "@/components/ui/Alert";

const STATS_ADMIN = [
  { key: "usuarios", label: "Usuarios", href: "/usuarios", cargar: () => api.usuarios.lista() },
  { key: "tiposHabitacion", label: "Tipos de habitación", href: "/tipos-habitacion", cargar: () => api.tiposHabitacion.lista() },
  { key: "habitaciones", label: "Habitaciones", href: "/habitaciones", cargar: () => api.habitaciones.lista() },
  { key: "reservas", label: "Reservas", href: "/reservas", cargar: () => api.reservas.lista() },
  { key: "clientes", label: "Clientes", href: "/clientes", cargar: () => api.clientes.lista() },
];

const STATS_RECEPCION = [
  { key: "habitaciones", label: "Habitaciones", href: "/habitaciones", cargar: () => api.habitaciones.lista() },
  { key: "reservas", label: "Reservas", href: "/reservas", cargar: () => api.reservas.lista() },
  { key: "clientes", label: "Clientes", href: "/clientes", cargar: () => api.clientes.lista() },
];

function statsParaRol(rol) {
  if (rol === ROLES.ADMINISTRADOR) return STATS_ADMIN;
  if (rol === ROLES.RECEPCIONISTA) return STATS_RECEPCION;
  return [];
}

function accesosParaRol(rol) {
  if (rol === ROLES.ADMINISTRADOR) {
    return [
      { href: "/usuarios", label: "Gestionar usuarios" },
      { href: "/tipos-habitacion", label: "Tipos de habitación" },
      { href: "/habitaciones", label: "Habitaciones" },
      { href: "/reservas", label: "Reservas" },
      { href: "/clientes", label: "Clientes" },
    ];
  }

  if (rol === ROLES.RECEPCIONISTA) {
    return [
      { href: "/reservas", label: "Reservas" },
      { href: "/clientes", label: "Clientes" },
      { href: "/habitaciones", label: "Habitaciones" },
      { href: "/recepcion/check-in", label: "Check-in" },
      { href: "/recepcion/check-out", label: "Check-out" },
    ];
  }

  if (rol === ROLES.CLIENTE) {
    return [{ href: "/mis-reservas", label: "Mis reservas" }];
  }

  return [];
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [stats, setStats] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [lastPing, setLastPing] = useState(null);

  useEffect(() => {
    let cancelado = false;
    const items = statsParaRol(rol);

    const cargar = async () => {
      setCargando(true);
      setError(null);

      if (items.length === 0) {
        try {
          const health = await api.health();
          if (!cancelado) {
            setLastPing(health?.status ? `Backend: ${health.status}` : "Backend desconocido");
            setCargando(false);
          }
        } catch (err) {
          if (!cancelado) {
            setError(err?.message || "No se pudo contactar el backend.");
            setCargando(false);
          }
        }
        return;
      }

      const resultados = await Promise.allSettled(
        items.map((item) => item.cargar())
      );

      const siguiente = {};
      resultados.forEach((resultado, indice) => {
        const item = items[indice];
        if (resultado.status === "fulfilled") {
          const lista = resultado.value;
          siguiente[item.key] = {
            count: Array.isArray(lista) ? lista.length : 0,
            status: "ok",
          };
        } else {
          siguiente[item.key] = { count: undefined, status: "error" };
        }
      });

      try {
        const health = await api.health();
        if (!cancelado) {
          setLastPing(health?.status ? `Backend: ${health.status}` : "Backend desconocido");
        }
      } catch (_err) {
        // El estado de las tarjetas ya refleja si la API falló.
      }

      if (!cancelado) {
        setStats(siguiente);
        setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [rol]);

  const accesos = accesosParaRol(rol);
  const statsVisibles = statsParaRol(rol);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Hola, {usuario?.nombre_usuario || "usuario"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Bienvenido al panel de gestión del hotel. Su rol es{" "}
          <span className="font-medium text-amber-300">{rol || "sin rol"}</span>.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !cargando && !error
              ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300"
              : error
              ? "border-red-500/25 bg-red-500/15 text-red-300"
              : "border-zinc-700 bg-zinc-800 text-zinc-400"
          }`}
        >
          {cargando ? "Verificando..." : error ? "Backend no disponible" : "Backend conectado"}
        </span>
        {lastPing && <span className="text-xs text-zinc-500">{lastPing}</span>}
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
            {error}
          </Alert>
        </div>
      )}

      {rol === ROLES.CLIENTE ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-white">Mis reservas</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Consulte, cree, modifique o cancele sus propias reservas.
            </p>
            <div className="mt-5">
              <Link href="/mis-reservas">
                <Button>Ir a mis reservas</Button>
              </Link>
            </div>
          </Card>

          <Card className="border-amber-400/20 bg-amber-400/5 p-6">
            <h2 className="text-sm font-medium text-amber-300">Módulo en construcción</h2>
            <p className="mt-2 text-sm text-zinc-400">
              La funcionalidad completa de reservas del cliente está siendo
              implementada por el equipo. La ruta y el control de acceso ya están
              preparados.
            </p>
            <p className="mt-3 text-xs text-zinc-500">TODO(equipo): completar “Mis reservas”.</p>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statsVisibles.map((item) => {
              const valor = stats[item.key];
              const count = valor?.count;
              const itemStatus = valor?.status;

              return (
                <Card key={item.key} className="p-5">
                  <div className="text-sm text-zinc-400">{item.label}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-semibold ${
                        (itemStatus === "ok" && count !== undefined) || count === 0
                          ? "text-white"
                          : "text-zinc-500"
                      }`}
                    >
                      {cargando ? (
                        <SkeletonCard width={80} height={34} />
                      ) : count === undefined ? (
                        "—"
                      ) : (
                        count
                      )}
                    </span>
                    {itemStatus === "error" && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300">
                        sin datos
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm">
                        Administrar
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-medium text-white">Accesos rápidos</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {accesos.map((acceso) => (
                <Link key={acceso.href} href={acceso.href}>
                  <Button variant="secondary">{acceso.label}</Button>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
