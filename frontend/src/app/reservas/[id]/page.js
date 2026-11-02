"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

export default function ReservaDetailPage({ params }) {
  const { id } = use(params);
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.reservas.porId(id);
        if (!cancelled) {
          if (data) {
            setReserva(data);
          } else {
            setError(`No se encontró la reserva ${id}.`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la reserva.");
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
          <Link href="/reservas">
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
          <Link href={`/reservas/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Link href="/reservas">
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </div>
      )}

      {!loading && reserva && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-medium text-zinc-400">Información de la reserva</h2>
            <div className="mt-4 space-y-3">
              <Field label="ID" value={String(reserva.id_reserva)} />
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Fecha de registro</div>
                <div className="mt-1 text-base font-medium text-white">
                  {reserva.fecha_reserva || "—"}
                </div>
              </div>
              <Field label="Cliente (ID)" value={String(reserva.id_cliente)} />
              <Field label="Habitación (ID)" value={String(reserva.id_habitacion)} />
              <Field label="Fecha de entrada" value={reserva.fecha_entrada || "—"} />
              <Field label="Fecha de salida" value={reserva.fecha_salida || "—"} />
              <Field label="Cantidad de huéspedes" value={String(reserva.cantidad_huespedes)} />
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Total</div>
                <div className="mt-1 text-base font-medium text-white">
                  {reserva.total != null ? `$${reserva.total.toFixed(2)}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">Estado</div>
                <div className="mt-1">
                  <EstadoChip estado={reserva.estado} />
                </div>
              </div>
              <Field
                label="Observaciones"
                value={reserva.observaciones || "—"}
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
    estado === "CONFIRMADA" || estado === "CHECKIN" || estado === "CHECKOUT"
      ? "text-emerald-300 bg-emerald-500/10"
      : estado === "CANCELADA"
      ? "text-red-300 bg-red-500/10"
      : "text-amber-300 bg-amber-500/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {estado}
    </span>
  );
}
