"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

export default function ClienteForm({ initial = {}, onSchemaChange }) {
  const [idUsuario, setIdUsuario] = useState(
    initial.id_usuario != null ? String(initial.id_usuario) : ""
  );
  const [documento, setDocumento] = useState(initial.documento || "");
  const [telefono, setTelefono] = useState(initial.telefono || "");
  const [direccion, setDireccion] = useState(initial.direccion || "");
  const [fechaNacimiento, setFechaNacimiento] = useState(
    initial.fecha_nacimiento || ""
  );

  if (onSchemaChange) {
    onSchemaChange({
      id_usuario: idUsuario ? Number(idUsuario) : undefined,
      documento: documento.trim(),
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null,
      fecha_nacimiento: fechaNacimiento || null,
    });
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="ID de usuario *"
          type="number"
          min="1"
          value={idUsuario}
          onChange={(e) => setIdUsuario(e.target.value)}
          name="id_usuario"
          required
        />
        <Input
          label="Documento *"
          placeholder="Ej. CC 12345678"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          name="documento"
          maxLength={30}
          required
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Teléfono"
          placeholder="Ej. +57 300 123 4567"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          name="telefono"
          maxLength={20}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
          name="fecha_nacimiento"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Dirección"
          placeholder="Dirección del cliente"
          rows={3}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          name="direccion"
          maxLength={150}
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
