"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import TipoHabitacionForm from "../../../components/tipos-habitacion/TipoHabitacionForm";
import { UI } from "../../../lib/constants";

export default function NuevoTipoHabitacionPage() {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    precio_noche: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.tiposHabitacion.crear({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        capacidad: Number(form.capacidad),
        precio_noche: Number(form.precio_noche) || 0,
      });
      setSuccess(UI.successCreado);
      setTimeout(() => {
        window.location.href = "/tipos-habitacion";
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : UI.errorDesconocido);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold text-white">Nuevo tipo de habitación</h1>
        </div>
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

      <Card className="p-6">
        <TipoHabitacionForm initial={form} onSchemaChange={setForm} />
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
          <Link href="/tipos-habitacion">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button variant="primary" loading={loading} onClick={handleSave}>
            Crear
          </Button>
        </div>
      </Card>
    </div>
  );
}