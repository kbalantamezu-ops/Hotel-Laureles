"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function HabitacionForm({ initial = {}, onSchemaChange }) {
  const [numero, setNumero] = useState(initial.numero || "");
  const [piso, setPiso] = useState(initial.piso != null ? String(initial.piso) : "");
  const [estado, setEstado] = useState(initial.estado || "DISPONIBLE");
  const [descripcion, setDescripcion] = useState(initial.descripcion || "");
  const [idTipoHabitacion, setIdTipoHabitacion] = useState(
    initial.id_tipo_habitacion != null ? String(initial.id_tipo_habitacion) : ""
  );

  // Tipos de habitación cargados para el select.
  const [tipos, setTipos] = useState([]);
  const [tiposLoading, setTiposLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.tiposHabitacion
      .lista()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setTipos(data);
      })
      .catch(() => {
        if (!cancelled) {
          console.warn("[HabitacionForm] No se pudieron cargar los tipos.");
        }
      })
      .finally(() => {
        if (!cancelled) setTiposLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (onSchemaChange) {
    onSchemaChange({
      numero,
      piso,
      estado,
      descripcion,
      id_tipo_habitacion: idTipoHabitacion
        ? Number(idTipoHabitacion)
        : undefined,
    });
  }

  const tipoOptions = [
    <option key="" value="">
      Selecciona un tipo
    </option>,
  ];

  if (tiposLoading) {
    tipoOptions.push(
      <option key="loading" value="">
        Cargando tipos...
      </option>
    );
  } else {
    tipos.forEach((tipo) => {
      tipoOptions.push(
        <option key={tipo.id_tipo_habitacion} value={tipo.id_tipo_habitacion}>
          {tipo.nombre} ({tipo.capacidad} pers.)
        </option>
      )
    });
  }

  const ESTADOS_HABITACION = [
    { value: "DISPONIBLE", label: "Disponible" },
    { value: "OCUPADA", label: "Ocupada" },
    { value: "Mantenimiento", label: "Mantenimiento" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Número de habitación *"
          placeholder="Ej. 101"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          name="numero"
          maxLength={10}
          required
        />
        <Input
          label="Piso *"
          type="number"
          min="0"
          value={piso}
          onChange={(e) => setPiso(e.target.value)}
          name="piso"
          required
        />
      </div>

      <div className="mt-4">
        <Select
          label="Tipo de habitación *"
          value={idTipoHabitacion}
          onChange={(e) => setIdTipoHabitacion(e.target.value)}
          name="id_tipo_habitacion"
          required
        >
          {tipoOptions}
        </Select>
      </div>

      <div className="mt-4">
        <Select
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          name="estado"
        >
          {ESTADOS_HABITACION.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4">
        <textarea
          className="w-full resize-y rounded-md border border-zinc-700 bg-[#1f2937] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-amber-400/50 outline-none transition-colors"
          rows={3}
          placeholder="Descripción opcional de la habitación"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          name="descripcion"
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
