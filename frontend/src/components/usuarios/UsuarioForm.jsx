"use client";

import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const RE_NOMBRE_USUARIO = /^[a-zA-Z0-9._-]{3,50}$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UsuarioForm({
  modo = "crear",
  initial = {},
  roles = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  errores = [],
}) {
  const esCrear = modo === "crear";

  const [form, setForm] = useState({
    nombre_usuario: initial.nombre_usuario || "",
    correo: initial.correo || "",
    password: "",
    rol: initial.rol || "",
    estado: initial.estado || "ACTIVO",
  });
  const [validacion, setValidacion] = useState({});

  const setCampo = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setValidacion((actual) => ({ ...actual, [campo]: undefined }));
  };

  const validar = () => {
    const erroresLocales = {};

    if (!form.nombre_usuario.trim()) {
      erroresLocales.nombre_usuario = "El nombre de usuario es obligatorio.";
    } else if (!RE_NOMBRE_USUARIO.test(form.nombre_usuario.trim())) {
      erroresLocales.nombre_usuario =
        "Use entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo.";
    }

    if (!form.correo.trim()) {
      erroresLocales.correo = "El correo es obligatorio.";
    } else if (!RE_CORREO.test(form.correo.trim())) {
      erroresLocales.correo = "Ingrese un correo válido.";
    }

    if (esCrear) {
      if (!form.password) {
        erroresLocales.password = "La contraseña es obligatoria.";
      } else if (form.password.length < 8) {
        erroresLocales.password = "Debe tener al menos 8 caracteres.";
      }

      if (!form.rol) {
        erroresLocales.rol = "Seleccione un rol.";
      }
    }

    setValidacion(erroresLocales);
    return Object.keys(erroresLocales).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validar()) return;

    const payload = {
      nombre_usuario: form.nombre_usuario.trim(),
      correo: form.correo.trim().toLowerCase(),
      estado: form.estado,
    };

    if (esCrear) {
      payload.password = form.password;
      payload.rol = form.rol;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <Alert variant="error">
          <div>{error}</div>
          {errores.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errores.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <Input
        label="Nombre de usuario *"
        name="nombre_usuario"
        value={form.nombre_usuario}
        onChange={(event) => setCampo("nombre_usuario", event.target.value)}
        error={validacion.nombre_usuario}
        placeholder="ej. recep.maria"
        disabled={loading}
        autoComplete="off"
      />

      <Input
        label="Correo electrónico *"
        name="correo"
        type="email"
        value={form.correo}
        onChange={(event) => setCampo("correo", event.target.value)}
        error={validacion.correo}
        placeholder="usuario@laureles.com"
        disabled={loading}
        autoComplete="off"
      />

      {esCrear && (
        <>
          <Input
            label="Contraseña *"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) => setCampo("password", event.target.value)}
            error={validacion.password}
            placeholder="Mínimo 8 caracteres"
            disabled={loading}
            autoComplete="new-password"
          />

          <Select
            label="Rol *"
            name="rol"
            value={form.rol}
            onChange={(event) => setCampo("rol", event.target.value)}
            error={validacion.rol}
            disabled={loading}
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.nombre}>
                {rol.nombre}
              </option>
            ))}
          </Select>
        </>
      )}

      {!esCrear && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
          El rol se cambia desde la acción “Cambiar rol”. La contraseña se
          restablece desde el detalle del usuario.
        </div>
      )}

      <Select
        label="Estado"
        name="estado"
        value={form.estado}
        onChange={(event) => setCampo("estado", event.target.value)}
        disabled={loading}
      >
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </Select>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {esCrear ? "Crear usuario" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
