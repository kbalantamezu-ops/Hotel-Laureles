"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import HabitacionForm from "../../components/habitaciones/HabitacionForm";
import { UI } from "../../lib/constants";

export default function HabitacionesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createError, setCreateError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.habitaciones.lista();
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      setData([]);
      setError(err instanceof Error ? err.message : UI.errorCarga);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (form) => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await api.habitaciones.crear({
        numero: form.numero.trim(),
        piso: Number(form.piso),
        id_tipo_habitacion: form.id_tipo_habitacion,
        estado: form.estado,
        descripcion: form.descripcion.trim() || null,
      });
      setCreateSuccess(UI.successCreado);
      setShowCreate(false);
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : UI.errorDesconocido);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.habitaciones.eliminar(deleteTarget.id_habitacion);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : UI.errorDesconocido);
    } finally {
      setDeleteLoading(false);
    }
  };

  const headers = [
    "ID",
    "Número",
    "Piso",
    "Estado",
    "Tipo de habitación",
    "Descripción",
    "Acciones",
  ];

  const rows = data.map((hab) => ({
    cells: [
      <span className="font-mono text-zinc-400">{hab.id_habitacion}</span>,
      <span className="font-medium text-white">{hab.numero}</span>,
      <span className="text-zinc-300">{hab.piso ?? "—"}</span>,
      <EstadoBadge estado={hab.estado} />,
      <span className="text-zinc-300">
        {hab.id_tipo_habitacion
          ? `Tipo ${hab.id_tipo_habitacion}`
          : "—"}
      </span>,
      <span className="max-w-[200px] truncate text-zinc-400">
        {hab.descripcion || "—"}
      </span>,
      <div className="flex gap-2">
        <Link href={`/habitaciones/${hab.id_habitacion}`}>
          <Button variant="ghost" size="sm">
            Ver
          </Button>
        </Link>
        <Link href={`/habitaciones/${hab.id_habitacion}/editar`}>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </Link>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20"
          onClick={() => setDeleteTarget(hab)}
        >
          Eliminar
        </button>
      </div>,
    ],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Habitaciones</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestión de habitaciones del hotel.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva habitación
        </Button>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
          {error}
        </Alert>
      )}

      <Card>
        <Table
          headers={headers}
          rows={rows}
          emptyMessage="No hay habitaciones registradas."
          emptyAction={
            !loading && (
              <Button onClick={() => setShowCreate(true)}>Crear la primera</Button>
            )
          }
        />
      </Card>

      {/* Crear */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateError(null);
          setCreateSuccess(null);
        }}
        title="Nueva habitación"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setCreateError(null);
                setCreateSuccess(null);
              }}
            >
              Cancelar
            </Button>

          </>
        }
      >
        {createSuccess && (
          <Alert variant="success" className="mb-4">
            {createSuccess}
          </Alert>
        )}
        {createError && (
          <Alert variant="error" className="mb-4">
            {createError}
          </Alert>
        )}
        <HabitacionFormSilently onSubmit={handleCreate} loading={createLoading} />
      </Modal>

      {/* Eliminar */}
      <Modal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title="Confirmar eliminación"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <div className="text-sm text-zinc-300">
          ¿Estás seguro de eliminar la habitación{" "}
          <span className="font-medium text-white">
            {deleteTarget?.numero || deleteTarget?.id_habitacion}
          </span>
          ? Esta acción no se puede deshacer.
        </div>
        {deleteError && (
          <Alert variant="error" className="mt-4">
            {deleteError}
          </Alert>
        )}
      </Modal>
    </div>
  );
}

function EstadoBadge({ estado }) {
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

function HabitacionFormSilently({ onSubmit, loading }) {
  const [form, setForm] = useState({
    numero: "",
    piso: "",
    id_tipo_habitacion: "",
    estado: "DISPONIBLE",
    descripcion: "",
  });

  const submit = () => {
    if (!form.numero.trim() || !form.piso || !form.id_tipo_habitacion) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-2">
      <HabitacionForm initial={form} onSchemaChange={setForm} />
      <div className="mt-4 flex justify-end">
        <Button variant="primary" loading={loading} onClick={submit}>
          Crear
        </Button>
      </div>
    </div>
  );
}
