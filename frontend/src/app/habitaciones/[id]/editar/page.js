"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Alert from "../../../../components/ui/Alert";
import HabitacionForm from "../../../../components/habitaciones/HabitacionForm";
import { UI } from "../../../../lib/constants";

export default function HabitacionEditPage({ params }) {
  const { id } = use(params);
  const [hab, setHab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    numero: "",
    piso: "",
    id_tipo_habitacion: "",
    estado: "DISPONIBLE",
    descripcion: "",
  });

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
            setForm({
              numero: data.numero || "",
              piso: data.piso != null ? String(data.piso) : "",
              id_tipo_habitacion: data.id_tipo_habitacion != null
                ? String(data.id_tipo_habitacion)
                : "",
              estado: data.estado || "DISPONIBLE",
              descripcion: data.descripcion || "",
            });
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

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.habitaciones.actualizar(id, {
        numero: form.numero.trim(),
        piso: Number(form.piso),
        id_tipo_habitacion: form.id_tipo_habitacion
          ? Number(form.id_tipo_habitacion)
          : undefined,
        estado: form.estado,
        descripcion: form.descripcion.trim() || null,
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
          <Link href="/habitaciones">
            <Button variant="ghost" size="sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Editar habitación</h1>
        </div>
        <Link href="/habitaciones">
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-zinc-800" />
          ))}
        </Card>
      ) : hab ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
            </svg>
            Editar habitación #{hab.id_habitacion}
          </div>

          <HabitacionForm initial={form} onSchemaChange={setForm} />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              variant="ghost"
              onClick={() => {
                setForm({
                  numero: hab.numero || "",
                  piso: hab.piso != null ? String(hab.piso) : "",
                  id_tipo_habitacion: hab.id_tipo_habitacion != null
                    ? String(hab.id_tipo_habitacion)
                    : "",
                  estado: hab.estado || "DISPONIBLE",
                  descripcion: hab.descripcion || "",
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
