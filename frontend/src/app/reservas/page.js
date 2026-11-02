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
import ReservaForm from "../../components/reservas/ReservaForm";
import { UI } from "../../lib/constants";

export default function ReservasPage() {
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
      const response = await api.reservas.lista();
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
      await api.reservas.crear({
        id_cliente: form.id_cliente,
        id_habitacion: form.id_habitacion,
        fecha_entrada: form.fecha_entrada,
        fecha_salida: form.fecha_salida,
        cantidad_huespedes: form.cantidad_huespedes,
        total: form.total,
        estado: form.estado,
        observaciones: form.observaciones.trim() || null,
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
      await api.reservas.eliminar(deleteTarget.id_reserva);
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
    "Cliente",
    "Habitación",
    "Entrada",
    "Salida",
    "Huéspedes",
    "Total",
    "Estado",
    "Acciones",
  ];

  const rows = data.map((reserva) => ({
    cells: [
      <span className="font-mono text-zinc-400">{reserva.id_reserva}</span>,
      <span className="text-zinc-300">
        Cliente #{reserva.id_cliente}
      </span>,
      <span className="text-zinc-300">
        Hab #{reserva.id_habitacion}
      </span>,
      <span className="text-zinc-300">{reserva.fecha_entrada}</span>,
      <span className="text-zinc-300">{reserva.fecha_salida}</span>,
      <span className="text-zinc-300">{reserva.cantidad_huespedes}</span>,
      <span className="text-zinc-300">
        {reserva.total != null ? `$${reserva.total.toFixed(2)}` : "—"}
      </span>,
      <EstadoBadge estado={reserva.estado} />,
      <div className="flex gap-2">
        <Link href={`/reservas/${reserva.id_reserva}`}>
          <Button variant="ghost" size="sm">
            Ver
          </Button>
        </Link>
        <Link href={`/reservas/${reserva.id_reserva}/editar`}>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </Link>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20"
          onClick={() => setDeleteTarget(reserva)}
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
          <h1 className="text-2xl font-semibold text-white">Reservas</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestión de reservas del hotel.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva reserva
        </Button>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
          {error}
        </Alert>
      )}

      <Card className="overflow-x-auto">
        <Table
          headers={headers}
          rows={rows}
          emptyMessage="No hay reservas registradas."
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
        title="Nueva reserva"
        size="lg"
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
            <Button variant="primary" loading={createLoading}>
              Crear
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
        <ReservaFormSilently onSubmit={handleCreate} loading={createLoading} />
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
          ¿Estás seguro de eliminar la reserva{" "}
          <span className="font-medium text-white">
            #{deleteTarget?.id_reserva}
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

function ReservaFormSilently({ onSubmit, loading }) {
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

  const submit = () => {
    if (
      !form.id_cliente ||
      !form.id_habitacion ||
      !form.fecha_entrada ||
      !form.fecha_salida ||
      !form.cantidad_huespedes ||
      form.total === ""
    ) {
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-2">
      <ReservaForm initial={form} onSchemaChange={setForm} />
      <div className="mt-4 flex justify-end">
        <Button variant="primary" loading={loading} onClick={submit}>
          Crear
        </Button>
      </div>
    </div>
  );
}
