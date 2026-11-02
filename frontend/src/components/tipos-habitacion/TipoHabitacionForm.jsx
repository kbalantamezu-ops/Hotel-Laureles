"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function TipoHabitacionForm({
  initial = {},
  onSchemaChange,
  children,
}) {
  const [nombre, setNombre] = useState(initial.nombre || "");
  const [descripcion, setDescripcion] = useState(initial.descripcion || "");
  const [capacidad, setCapacidad] = useState(initial.capacidad || "");
  const [precioNoche, setPrecioNoche] = useState(
    initial.precio_noche != null ? String(initial.precio_noche) : ""
  );

  const reset = () => {
    setNombre(initial.nombre || "");
    setDescripcion(initial.descripcion || "");
    setCapacidad(initial.capacidad || "");
    setPrecioNoche(
      initial.precio_noche != null ? String(initial.precio_noche) : ""
    );
  };

  if (onSchemaChange) {
    onSchemaChange({ nombre, descripcion, capacidad, precio_noche });
  }

  const capacidadOptions = [];
  for (let i = 1; i <= 8; i++) {
    capacidadOptions.push(
      <option key={i} value={i}>
        {i} {i === 1 ? "persona" : "personas"}
      </option>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre *"
          placeholder="Ej. Junior Suite"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          name="nombre"
          required
        />
        <Select
          label="Capacidad *"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          name="capacidad"
          required
        >
          <option value="">Selecciona capacidad</option>
          {capacidadOptions}
        </Select>
      </div>

      <div className="mt-4">
        <Input
          label="Precio por noche *"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ej. 50000"
          value={precioNoche}
          onChange={(e) => setPrecioNoche(e.target.value)}
          name="precio_noche"
          required
        />
        <p className="mt-1 text-xs text-zinc-500">
          El valor se enviará numérico al backend.
        </p>
      </div>

      <div className="mt-4">
        <textarea
          className="w-full resize-y rounded-md border border-zinc-700 bg-[#1f2937] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-amber-400/50 outline-none transition-colors"
          rows={3}
          placeholder="Descripción opcional del tipo de habitación"
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

      {children}
    </div>
  );
}
