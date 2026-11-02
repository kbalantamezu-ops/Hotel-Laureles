"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { RESOURCE_TITLES } from "../lib/constants";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SkeletonCard from "../components/ui/SkeletonCard";

const STATS = [
  { key: "tiposHabitacion", label: "Tipos de habitación", href: "/tipos-habitacion" },
  { key: "habitaciones", label: "Habitaciones", href: "/habitaciones" },
  { key: "reservas", label: "Reservas", href: "/reservas" },
  { key: "clientes", label: "Clientes", href: "/clientes" },
];

const STATUS_IDLE = "idle";
const STATUS_LOADING = "loading";
const STATUS_OK = "ok";
const STATUS_ERROR = "error";

export default function DashboardPage() {
  const [status, setStatus] = useState(STATUS_IDLE);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [lastPing, setLastPing] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setError(null);
      const next = {};

      try {
        // Contamos cada recurso para las tarjetas rápidas.
        const counts = await Promise.allSettled([
          api.tiposHabitacion.lista(),
          api.habitaciones.lista(),
          api.reservas.lista(),
          api.clientes.lista(),
        ]);

        for (const result of counts) {
          const index = counts.indexOf(result);
          const resourceKey = STATS[index].key;
          if (result.status === "fulfilled") {
            const list = result.value;
            next[resourceKey] = {
              count: Array.isArray(list) ? list.length : 0,
              status: "ok",
            };
          } else {
            next[resourceKey] = {
              count: undefined,
              status: "error",
            };
          }
        }

        // Ping simple para saber si la API está viva.
        const health = await api.health();
        if (!cancelled) {
          setLastPing(health?.status ? `Backend: ${health.status}` : "Backend desconocido");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo contactar el backend.");
        }
      }

      if (!cancelled) {
        setStats(next);
        setStatus("ok");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = status === STATUS_LOADING;
  const hasError = status === STATUS_ERROR;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Área de trabajo</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Bienvenido al panel de gestión del hotel. Usa el menú lateral para
          gestionar cada módulo.
        </p>
      </div>

      {/* Estado global del backend */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === "ok"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              : status === "error"
              ? "bg-red-500/15 text-red-300 border border-red-500/25"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          {isLoading
            ? "Verificando..."
            : hasError
            ? "Backend no disponible"
            : "Backend conectado"}
        </span>
        {lastPing && (
          <span className="text-xs text-zinc-500">{lastPing}</span>
        )}
        {error && (
          <span className="text-xs text-red-300">{error}</span>
        )}
      </div>

      {/* Tarjetas rápidas */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const item = stats[stat.key];
          const count = item?.count;
          const itemStatus = item?.status;

          return (
            <Card key={stat.key} className="p-5">
              <div className="text-sm text-zinc-400">{stat.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-semibold ${
                    (itemStatus === "ok" && count !== undefined) ||
                    count === 0
                      ? "text-white"
                      : "text-zinc-500"
                  }`}
                >
                  {isLoading ? (
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
                <Link href={stat.href}>
                  <Button variant="ghost" size="sm">
                    Administrar
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Accesos rápidos */}
      <div className="mt-10">
        <h2 className="text-lg font-medium text-white">Accesos rápidos</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {STATS.map((stat) => (
            <Link key={stat.key} href={stat.href}>
              <Button variant="secondary">
                {(RESOURCE_TITLES[stat.key] || stat.label)}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
