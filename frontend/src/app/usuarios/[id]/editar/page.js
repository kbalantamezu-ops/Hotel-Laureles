"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageLoader from "@/components/ui/PageLoader";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

export default function EditarUsuarioPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState([]);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setErrorCarga(null);
      try {
        const data = await api.usuarios.porId(id);
        if (!cancelado) setUsuario(data);
      } catch (err) {
        if (!cancelado) {
          setErrorCarga(err?.message || "No se pudo cargar el usuario.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  const guardar = async (payload) => {
    setGuardando(true);
    setError(null);
    setErrores([]);
    setExito(null);
    try {
      const data = await api.usuarios.actualizar(id, payload);
      setUsuario(data.usuario);
      setExito("Usuario actualizado correctamente.");
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el usuario.");
      setErrores(Array.isArray(err?.errors) ? err.errors : []);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <PageLoader label="Cargando usuario..." />;
  }

  if (errorCarga || !usuario) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert variant="error">{errorCarga || "Usuario no encontrado."}</Alert>
        <Link href="/usuarios">
          <Button variant="secondary">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/usuarios/${id}`}>
          <Button variant="ghost" size="sm">
            ← Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Editar usuario</h1>
          <p className="text-sm text-zinc-400">{usuario.nombre_usuario}</p>
        </div>
      </div>

      {exito && (
        <Alert variant="success" onDismiss={() => setExito(null)} showDismiss>
          {exito}
        </Alert>
      )}

      <Card className="p-6">
        <UsuarioForm
          modo="editar"
          initial={usuario}
          onSubmit={guardar}
          onCancel={() => router.push(`/usuarios/${id}`)}
          loading={guardando}
          error={error}
          errores={errores}
        />
      </Card>

      <p className="text-xs text-zinc-500">
        El nombre de usuario y el correo deben ser únicos. El rol se modifica
        desde el detalle del usuario.
      </p>
    </div>
  );
}
