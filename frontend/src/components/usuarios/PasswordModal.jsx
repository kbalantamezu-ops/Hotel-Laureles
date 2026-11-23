"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

// Se monta solo cuando el modal está abierto, así que el formulario
// siempre arranca vacío sin necesidad de un efecto de reinicio.
export default function PasswordModal({ open = true, onClose, usuario, onSaved }) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const guardar = async () => {
    setError(null);
    setExito(false);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    try {
      await api.usuarios.cambiarPassword(usuario.id_usuario, { password });
      setExito(true);
      setPassword("");
      setConfirmacion("");
      onSaved?.();
    } catch (err) {
      setError(err?.message || "No se pudo restablecer la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Restablecer contraseña"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={guardando}>
            Cerrar
          </Button>
          <Button onClick={guardar} loading={guardando}>
            Restablecer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {exito && (
          <Alert variant="success">
            Contraseña actualizada correctamente para {usuario?.nombre_usuario}.
          </Alert>
        )}

        <p className="text-sm text-zinc-400">
          Nueva contraseña para{" "}
          <span className="font-medium text-white">{usuario?.nombre_usuario}</span>.
        </p>

        <Input
          label="Nueva contraseña"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          disabled={guardando}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar contraseña"
          name="confirmacion"
          type="password"
          value={confirmacion}
          onChange={(event) => setConfirmacion(event.target.value)}
          placeholder="Repita la contraseña"
          disabled={guardando}
          autoComplete="new-password"
        />
      </div>
    </Modal>
  );
}
