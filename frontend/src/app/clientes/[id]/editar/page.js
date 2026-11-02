"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Alert from "../../../../components/ui/Alert";
import ClienteForm from "../../../../components/clientes/ClienteForm";
import { UI } from "../../../../lib/constants";

export default function ClienteEditPage({ params }) {
  const { id } = use(params);
  const [cli, setCli] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    id_usuario: "",
    documento: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.clientes.porId(id);
        if (!cancelled) {
          if (data) {
            setCli(data);
            setForm({
              id_usuario: data.id_usuario != null ? String(data.id_usuario) : "",
              documento: data.documento || "",
              telefono: data.telefono || "",
              direccion: data.direccion || "",
              fecha_nacimiento: data.fecha_nacimiento || "",
            });
          } else {
            setError(`No se encontró el cliente ${id}.`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el cliente.");
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
      await api.clientes.actualizar(id, {
        id_usuario: form.id_usuario ? Number(form.id_usuario) : undefined,
        documento: form.documento.trim(),
        telefono: form.telefono.trim() || null,
        direccion: form.direccion.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
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
          <Link href="/clientes">
            <Button variant="ghost" size="sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Editar cliente</h1>
        </div>
        <Link href="/clientes">
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
      ) : cli ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400">
            <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
            </svg>
            Editar cliente #{cli.id_cliente}
          </div>

          <ClienteForm initial={form} onSchemaChange={setForm} />

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-5">
            <Button
              variant="ghost"
              onClick={() => {
                setForm({
                  id_usuario: cli.id_usuario != null ? String(cli.id_usuario) : "",
                  documento: cli.documento || "",
                  telefono: cli.telefono || "",
                  direccion: cli.direccion || "",
                  fecha_nacimiento: cli.fecha_nacimiento || "",
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
