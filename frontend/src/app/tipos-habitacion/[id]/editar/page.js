"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Alert from "../../../../components/ui/Alert";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import TipoHabitacionForm from "../../../../components/tipos-habitacion/TipoHabitacionForm";
import { UI } from "../../../../lib/constants";

export default function TipoHabitacionEditPage({ params }) {
  const { id } = use(params);
  const [tipo, setTipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    precio_noche: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.tiposHabitacion.porId(id);
        if (!cancelled) {
          if (data) {
            setTipo(data);
            setForm({
              nombre: data.nombre || "",
              descripcion: data.descripcion || "",
              capacidad: String(data.capacidad || ""),
              precio_noche: data.precio_noche != null ? String(data.precio_noche) : "",
            });
          } else {
            setError(`No se encontró el tipo de habitación ${id}.`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el tipo.");
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
      await api.tiposHabitacion.actualizar(id, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        capacidad: Number(form.capacidad),
        precio_noche: Number(form.precio_noche) || 0,
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
          <Link href="/tipos-habitacion">
            <Button variant="ghost" size="sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Editar tipo</h1>
        </div>
        <Link href="/tipos-habitacion">
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
      ) : tipo ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
            </svg>
            Editar tipo de habitación #{tipo.id_tipo_habitacion}
          </div>

          <TipoHabitacionForm initial={form} onSchemaChange={setForm} />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              variant="ghost"
              onClick={() => {
                setForm({
                  nombre: tipo.nombre || "",
                  descripcion: tipo.descripcion || "",
                  capacidad: String(tipo.capacidad || ""),
                  precio_noche: tipo.precio_noche != null ? String(tipo.precio_noche) : "",
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
