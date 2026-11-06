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
import TipoHabitacionForm from "../../components/tipos-habitacion/TipoHabitacionForm";
import { UI } from "../../lib/constants";

export default function TiposHabitacionPage() {
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
      const response = await api.tiposHabitacion.lista();
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

  const handleCreate = async (dataToSend) => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await api.tiposHabitacion.crear({
        nombre: dataToSend.nombre,
        descripcion: dataToSend.descripcion || null,
        capacidad: Number(dataToSend.capacidad),
        precio_noche: Number(dataToSend.precio_noche) || 0,
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
      await api.tiposHabitacion.eliminar(deleteTarget.id_tipo_habitacion);
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
    "Nombre",
    "Capacidad",
    "Precio / noche",
    "Descripción",
    "Acciones",
  ];

  const rows = data.map((tipo) => ({
    cells: [
      <span className="font-mono text-zinc-400">{tipo.id_tipo_habitacion}</span>,
      <span className="font-medium text-white">{tipo.nombre}</span>,
      <span className="text-zinc-300">{tipo.capacidad}</span>,
      <span className="text-zinc-300">
        {tipo.precio_noche != null ? `${tipo.precio_noche.toLocaleString()}` : "—"}
      </span>,
      <span className="max-w-[200px] truncate text-zinc-400">
        {tipo.descripcion || "—"}
      </span>,
      <div className="flex gap-2">
        <Link href={`/tipos-habitacion/${tipo.id_tipo_habitacion}`}>
          <Button variant="ghost" size="sm">
            Ver
          </Button>
        </Link>
        <Link href={`/tipos-habitacion/${tipo.id_tipo_habitacion}/editar`}>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </Link>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20"
          onClick={() => setDeleteTarget(tipo)}
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
          <h1 className="text-2xl font-semibold text-white">Tipos de habitación</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestión de tipos de habitación del hotel.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo tipo
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
          emptyMessage="No hay tipos de habitación registrados."
          emptyAction={
            !loading && (
              <Button onClick={() => setShowCreate(true)}>Crear el primero</Button>
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
        title="Nuevo tipo de habitación"
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
        <TipoHabitacionFormSilently
          onSubmit={handleCreate}
          loading={createLoading}
        />
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
          ¿Estás seguro de eliminar el tipo{" "}
          <span className="font-medium text-white">
            {deleteTarget?.nombre || deleteTarget?.id_tipo_habitacion}
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

/**
 * Componente auxiliar interno para conectar el formulario con el handler de
 * creación sin acoplar el modal al formulario.
 */
function TipoHabitacionFormSilently({ onSubmit, loading }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    precio_noche: "",
  });

  const submit = () => {
    if (!form.nombre.trim() || !form.capacidad || !form.precio_noche) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-2">
      <TipoHabitacionForm
        initial={form}
        onSchemaChange={setForm}
      />
      <div className="mt-4 flex justify-end">
        <Button variant="primary" loading={loading} onClick={submit}>
          Crear
        </Button>
      </div>
    </div>
  );
}
