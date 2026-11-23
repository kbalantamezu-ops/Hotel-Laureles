"use client";

import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { api } from "../../lib/api";
import { UI } from "../../lib/constants";

export default function ReservaForm({ initial = {}, onSchemaChange, disabledDates }) {
  const [idCliente, setIdCliente] = useState(
    initial.id_cliente != null ? String(initial.id_cliente) : ""
  );
  const [idHabitacion, setIdHabitacion] = useState(
    initial.id_habitacion != null ? String(initial.id_habitacion) : ""
  );
  const [fechaEntrada, setFechaEntrada] = useState(initial.fecha_entrada || "");
  const [fechaSalida, setFechaSalida] = useState(initial.fecha_salida || "");
  const [cantidadHuespedes, setCantidadHuespedes] = useState(
    initial.cantidad_huespedes != null ? String(initial.cantidad_huespedes) : ""
  );
  const [total, setTotal] = useState(
    initial.total != null ? String(initial.total) : ""
  );
  const [estado, setEstado] = useState(initial.estado || "PENDIENTE");
  const [observaciones, setObservaciones] = useState(initial.observaciones || "");

  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [habitacionesLoading, setHabitacionesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.clientes.lista().then((data) => {
      if (!cancelled && Array.isArray(data)) {
        setClientes(data.filter((c) => c));
        setClientesLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setClientesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.habitaciones.lista().then((data) => {
      if (!cancelled && Array.isArray(data)) {
        setHabitaciones(data.filter((h) => h));
        setHabitacionesLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setHabitacionesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

useEffect(() => {
  if (onSchemaChange) {
    onSchemaChange({
      id_cliente: idCliente ? Number(idCliente) : undefined,
      id_habitacion: idHabitacion ? Number(idHabitacion) : undefined,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      cantidad_huespedes: cantidadHuespedes ? Number(cantidadHuespedes) : undefined,
      total: total ? Number(total) : undefined,
      estado,
      observaciones,
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [idCliente, idHabitacion, fechaEntrada, fechaSalida, cantidadHuespedes, total, estado, observaciones]);

  const estadoOptions = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "CONFIRMADA", label: "Confirmada" },
    { value: "CHECKIN", label: "Check-in" },
    { value: "CHECKOUT", label: "Check-out" },
    { value: "CANCELADA", label: "Cancelada" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Cliente *"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
          name="id_cliente"
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientesLoading ? (
            <option value="">Cargando clientes...</option>
          ) : (
            clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                Cliente #{c.id_cliente} — {c.documento || "Sin documento"}
              </option>
            ))
          )}
        </Select>

        <Select
          label="Habitación *"
          value={idHabitacion}
          onChange={(e) => setIdHabitacion(e.target.value)}
          name="id_habitacion"
          required
        >
          <option value="">Selecciona una habitación</option>
          {habitacionesLoading ? (
            <option value="">Cargando habitaciones...</option>
          ) : (
            habitaciones.map((h) => (
              <option key={h.id_habitacion} value={h.id_habitacion}>
                Hab #{h.id_habitacion} — {h.numero} (tipo {h.id_tipo_habitacion})
              </option>
            ))
          )}
        </Select>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Fecha de entrada *"
          type="date"
          value={fechaEntrada}
          onChange={(e) => setFechaEntrada(e.target.value)}
          name="fecha_entrada"
          required
        />
        <Input
          label="Fecha de salida *"
          type="date"
          value={fechaSalida}
          onChange={(e) => setFechaSalida(e.target.value)}
          name="fecha_salida"
          required
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Cantidad de huéspedes *"
          type="number"
          min="1"
          value={cantidadHuespedes}
          onChange={(e) => setCantidadHuespedes(e.target.value)}
          name="cantidad_huespedes"
          required
        />
        <Input
          label="Total *"
          type="number"
          min="0"
          step="0.01"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          name="total"
          required
        />
      </div>

      <div className="mt-4">
        <Select
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          name="estado"
        >
          {estadoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4">
        <Textarea
          label="Observaciones"
          placeholder="Observaciones opcionales de la reserva"
          rows={3}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          name="observaciones"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <span className="inline-block rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-amber-300">
          *
        </span>
        Campos obligatorios
      </div>
    </div>
  );
}
