"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import ClienteForm from "../../../components/clientes/ClienteForm";
import { UI } from "../../../lib/constants";

export default function NuevoClientePage() {
  const [form, setForm] = useState({
    id_usuario: "",
    documento: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.clientes.crear({
        id_usuario: form.id_usuario ? Number(form.id_usuario) : undefined,
        documento: form.documento.trim(),
        telefono: form.telefono.trim() || null,
        direccion: form.direccion.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
      });
      setSuccess(UI.successCreado);
      setTimeout(() => {
        window.location.href = "/clientes";
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
          <Link href="/clientes">
            <Button variant="ghost" size="sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Nuevo cliente</h1>
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
        <ClienteForm initial={form} onSchemaChange={setForm} />
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
          <Link href="/clientes">
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