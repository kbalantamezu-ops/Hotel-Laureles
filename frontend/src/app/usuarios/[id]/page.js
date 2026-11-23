"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { formatFechaHora } from "@/lib/format";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import PageLoader from "@/components/ui/PageLoader";
import RolBadge from "@/components/usuarios/RolBadge";
import RolModal from "@/components/usuarios/RolModal";
import PasswordModal from "@/components/usuarios/PasswordModal";

function Campo({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-base font-medium text-white">{children}</div>
    </div>
  );
}

export default function UsuarioDetallePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { usuario: usuarioActual } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const [modalRol, setModalRol] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [detalle, listaRoles] = await Promise.all([
          api.usuarios.porId(id),
          api.roles.lista(),
        ]);
        if (!cancelado) {
          setUsuario(detalle);
          setRoles(Array.isArray(listaRoles) ? listaRoles : []);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err?.message || "No se pudo cargar el usuario.");
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

  const eliminar = async () => {
    setEliminando(true);
    setDeleteError(null);
    try {
      await api.usuarios.eliminar(usuario.id_usuario);
      router.replace("/usuarios");
    } catch (err) {
      setDeleteError(err?.message || "No se pudo eliminar el usuario.");
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return <PageLoader label="Cargando usuario..." />;
  }

  if (error || !usuario) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert variant="error">{error || "Usuario no encontrado."}</Alert>
        <Link href="/usuarios">
          <Button variant="secondary">Volver al listado</Button>
        </Link>
      </div>
    );
  }

  const esUnoMismo = usuario.id_usuario === usuarioActual?.id_usuario;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/usuarios">
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {usuario.nombre_usuario}
            </h1>
            <p className="text-sm text-zinc-400">Detalle del usuario</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/usuarios/${usuario.id_usuario}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="ghost" onClick={() => setModalRol(true)}>
            Cambiar rol
          </Button>
          <Button variant="ghost" onClick={() => setModalPassword(true)}>
            Restablecer contraseña
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setDeleteError(null);
              setModalEliminar(true);
            }}
            disabled={esUnoMismo}
            title={esUnoMismo ? "No puede eliminar su propia cuenta" : "Eliminar usuario"}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {exito && (
        <Alert variant="success" onDismiss={() => setExito(null)} showDismiss>
          {exito}
        </Alert>
      )}

      {esUnoMismo && (
        <Alert variant="info">
          Esta es su propia cuenta. Por seguridad no puede eliminarla ni quitarse
          el rol de Administrador.
        </Alert>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-medium text-zinc-400">Datos de la cuenta</h2>
          <div className="mt-4 space-y-4">
            <Campo label="ID">{usuario.id_usuario}</Campo>
            <Campo label="Nombre de usuario">{usuario.nombre_usuario}</Campo>
            <Campo label="Correo">{usuario.correo}</Campo>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium text-zinc-400">Acceso y estado</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">Rol</div>
              <div className="mt-1">
                <RolBadge rol={usuario.rol} />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">Estado</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    usuario.estado === "ACTIVO"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {usuario.estado}
                </span>
              </div>
            </div>
            <Campo label="Fecha de creación">
              {formatFechaHora(usuario.fecha_creacion)}
            </Campo>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-medium text-zinc-400">Permisos del rol</h2>
        <p className="mt-3 text-sm text-zinc-400">
          {usuario.rol === "Administrador" &&
            "Gestión completa de usuarios y de habitaciones/tipos de habitación, además de supervisión de reservas y clientes."}
          {usuario.rol === "Recepcionista" &&
            "Gestión de reservas y clientes, consulta de habitaciones y ejecución de check-in/check-out."}
          {usuario.rol === "Cliente" &&
            "Consulta de habitaciones y gestión exclusiva de sus propias reservas."}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          La autorización se valida siempre en el backend; la interfaz solo
          refleja esos permisos.
        </p>
      </Card>

      {modalRol && (
        <RolModal
          key={`rol-${usuario.id_usuario}`}
          open
          onClose={() => setModalRol(false)}
          usuario={usuario}
          roles={roles}
          onSaved={(actualizado) => {
            setUsuario(actualizado);
            setExito("Rol actualizado correctamente.");
          }}
        />
      )}

      {modalPassword && (
        <PasswordModal
          key={`pass-${usuario.id_usuario}`}
          open
          onClose={() => setModalPassword(false)}
          usuario={usuario}
          onSaved={() => setExito("Contraseña restablecida correctamente.")}
        />
      )}

      <Modal
        open={modalEliminar}
        onClose={() => !eliminando && setModalEliminar(false)}
        title="Confirmar eliminación"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setModalEliminar(false)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={eliminar} loading={eliminando}>
              Eliminar usuario
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteError && <Alert variant="error">{deleteError}</Alert>}
          <p>
            ¿Está seguro de eliminar al usuario{" "}
            <span className="font-medium text-white">{usuario.nombre_usuario}</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </div>
  );
}
