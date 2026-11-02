"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Alert from "../../../../components/ui/Alert";
import ReservaForm from "../../../../components/reservas/ReservaForm";
import { UI } from "../../../../lib/constants";

export default function ReservaEditPage({ params }) {
  const { id } = use(params);
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    id_cliente: "",
    id_habitacion: "",
    fecha_entrada: "",
    fecha_salida: "",
    cantidad_huespedes: "",
    total: "",
    estado: "PENDIENTE",
    observaciones: "",
  });

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
            setForm({
              id_cliente: data.id_cliente != null ? String(data.id_cliente) : "",
              id_habitacion: data.id_habitacion != null ? String(data.id_habitacion) : "",
              fecha_entrada: data.fecha_entrada || "",
              fecha_salida: data.fecha_salida || "",
              cantidad_huespedes: data.cantidad_huespedes != null
                ? String(data.cantidad_huespedes)
                : "",
              total: data.total != null ? String(data.total) : "",
              estado: data.estado || "PENDIENTE",
              observaciones: data.observaciones || "",
            });
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

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.reservas.actualizar(id, {
        id_cliente: form.id_cliente ? Number(form.id_cliente) : undefined,
        id_habitacion: form.id_habitacion ? Number(form.id_habitacion) : undefined,
        fecha_entrada: form.fecha_entrada,
        fecha_salida: form.fecha_salida,
        cantidad_huespedes: form.cantidad_huespedes
          ? Number(form.cantidad_huespedes)
          : undefined,
        total: form.total ? Number(form.total) : undefined,
        estado: form.estado,
        observaciones: form.observaciones.trim() || null,
      });
      setSuccess(UI.successActualizado);
    } catch (err) {
      setError(err instanceof Error ? err.message : UI.errorDesconocido);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
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
          <h1 className="text-2xl font-semibold text-white">Editar reserva</h1>
        </div>
        <Link href="/reservas">
          <Button variant="ghost">Volver al listado</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onDismiss={() => setSuccess(null)} showDismiss>
          {success}
        </Alert>
      )}

      {loading ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </Card>
      ) : reserva ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
            </svg>
            Editar reserva #{reserva.id_reserva}
          </div>

          <ReservaForm initial={form} onSchemaChange={setForm} />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              variant="ghost"
              onClick={() => {
                setForm({
                  id_cliente: reserva.id_cliente != null ? String(reserva.id_cliente) : "",
                  id_habitacion: reserva.id_habitacion != null ? String(reserva.id_habitacion) : "",
                  fecha_entrada: reserva.fecha_entrada || "",
                  fecha_salida: reserva.fecha_salida || "",
                  cantidad_huespedes: reserva.cantidad_huespedes != null
                    ? String(reserva.cantidad_huespedes)
                    : "",
                  total: reserva.total != null ? String(reserva.total) : "",
                  estado: reserva.estado || "PENDIENTE",
                  observaciones: reserva.observaciones || "",
                });
              }}
            >
              Restaurar
            </Button>
            <Button
              variant="primary"
              loading={saveLoading}
              onClick={handleSave}
            >
              Guardar cambios
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
