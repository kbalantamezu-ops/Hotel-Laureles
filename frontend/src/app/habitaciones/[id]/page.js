"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

export default function HabitacionDetailPage({ params }) {
  const { id } = use(params);
  const [hab, setHab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.habitaciones.porId(id);
        if (!cancelled) {
          if (data) {
            setHab(data);
          } else {
            setError(`No se encontró la habitación ${id}.`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la habitación.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/habitaciones">
            <Button variant="ghost" size="sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Detalle</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/habitaciones/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Link href="/habitaciones">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
          {error}
        </Alert>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </div>
      )}

      {!loading && hab && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-medium text-zinc-400">Información de la habitación</h2>
            <div className="mt-4 space-y-3">
              <Field label="ID" value={String(hab.id_habitacion)} />
              <Field label="Número" value={hab.numero} />
              <Field label="Piso" value={hab.piso != null ? String(hab.piso) : "—"} />
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Estado</div>
                <div className="mt-1">
                  <EstadoChip estado={hab.estado} />
                </div>
              </div>
              <Field
                label="Tipo de habitación (ID)"
                value={hab.id_tipo_habitacion != null ? String(hab.id_tipo_habitacion) : "—"}
              />
              <Field
                label="Descripción"
                value={hab.descripcion || "—"}
                multiline
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, multiline }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div
        className={`mt-1 ${multiline ? "text-sm whitespace-pre-wrap" : "text-base font-medium text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

function EstadoChip({ estado }) {
  if (!estado) return <span className="text-zinc-500">—</span>;
  const color =
    estado === "DISPONIBLE"
      ? "text-emerald-300 bg-emerald-500/10"
      : estado === "OCUPADA"
      ? "text-red-300 bg-red-500/10"
      : "text-amber-300 bg-amber-500/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {estado}
    </span>
  );
}
