"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import RolBadge from "./RolBadge";

// Este componente se monta solo cuando el modal está abierto
// (ver page.js), por lo que su estado inicial ya refleja el usuario.
export default function RolModal({ open = true, onClose, usuario, roles, onSaved }) {
  const [rol, setRol] = useState(usuario?.rol || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    if (!usuario) return;
    if (!rol) {
      setError("Seleccione un rol.");
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      const data = await api.usuarios.cambiarRol(usuario.id_usuario, { rol });
      onSaved?.(data.usuario);
      onClose?.();
    } catch (err) {
      setError(err?.message || "No se pudo cambiar el rol.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cambiar rol"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={guardar} loading={guardando}>
            Guardar rol
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm">
          <span className="text-zinc-400">Usuario</span>
          <span className="font-medium text-white">{usuario?.nombre_usuario}</span>
        </div>

        <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm">
          <span className="text-zinc-400">Rol actual</span>
          <RolBadge rol={usuario?.rol} />
        </div>

        <Select
          label="Nuevo rol"
          name="rol"
          value={rol}
          onChange={(event) => setRol(event.target.value)}
          disabled={guardando}
        >
          <option value="">Seleccione un rol</option>
          {roles.map((item) => (
            <option key={item.id_rol} value={item.nombre}>
              {item.nombre}
            </option>
          ))}
        </Select>

        <p className="text-xs text-zinc-500">
          El backend impide que un administrador se quite a sí mismo el rol o
          que el sistema quede sin ningún Administrador activo.
        </p>
      </div>
    </Modal>
  );
}
