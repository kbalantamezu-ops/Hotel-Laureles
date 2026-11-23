"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { formatFecha } from "@/lib/format";
import { ROLE_OPTIONS } from "@/lib/roles";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import PageLoader from "@/components/ui/PageLoader";
import RolBadge from "@/components/usuarios/RolBadge";
import RolModal from "@/components/usuarios/RolModal";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

function EstadoBadge({ estado }) {
  const activo = estado === "ACTIVO";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        activo
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-800 text-zinc-400"
      }`}
    >
      {estado || "—"}
    </span>
  );
}

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [modalCrear, setModalCrear] = useState(false);
  const [creando, setCreando] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrores, setFormErrores] = useState([]);

  const [usuarioRol, setUsuarioRol] = useState(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [listaUsuarios, listaRoles] = await Promise.all([
        api.usuarios.lista(),
        api.roles.lista(),
      ]);
      setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
      setRoles(Array.isArray(listaRoles) ? listaRoles : []);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial: los setState ocurren solo después del await.
  // `cargar` se reutiliza para refrescar tras crear/eliminar.
  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const [listaUsuarios, listaRoles] = await Promise.all([
          api.usuarios.lista(),
          api.roles.lista(),
        ]);
        if (!cancelado) {
          setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
          setRoles(Array.isArray(listaRoles) ? listaRoles : []);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err?.message || "No se pudieron cargar los usuarios.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return usuarios.filter((item) => {
      const coincideTexto =
        !termino ||
        item.nombre_usuario?.toLowerCase().includes(termino) ||
        item.correo?.toLowerCase().includes(termino) ||
        String(item.id_usuario).includes(termino);

      const coincideRol = !filtroRol || item.rol === filtroRol;
      const coincideEstado = !filtroEstado || item.estado === filtroEstado;

      return coincideTexto && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const crearUsuario = async (payload) => {
    setCreando(true);
    setFormError(null);
    setFormErrores([]);
    try {
      const data = await api.usuarios.crear(payload);
      setModalCrear(false);
      setExito(`Usuario “${data.usuario?.nombre_usuario}” creado correctamente.`);
      await cargar();
    } catch (err) {
      setFormError(err?.message || "No se pudo crear el usuario.");
      setFormErrores(Array.isArray(err?.errors) ? err.errors : []);
    } finally {
      setCreando(false);
    }
  };

  const eliminarUsuario = async () => {
    if (!usuarioEliminar) return;
    setEliminando(true);
    setDeleteError(null);
    try {
      await api.usuarios.eliminar(usuarioEliminar.id_usuario);
      setExito(`Usuario “${usuarioEliminar.nombre_usuario}” eliminado correctamente.`);
      setUsuarioEliminar(null);
      await cargar();
    } catch (err) {
      setDeleteError(err?.message || "No se pudo eliminar el usuario.");
    } finally {
      setEliminando(false);
    }
  };

  const alCambiarRol = (usuarioActualizado) => {
    if (!usuarioActualizado) return;
    setUsuarios((actuales) =>
      actuales.map((item) =>
        item.id_usuario === usuarioActualizado.id_usuario
          ? { ...item, ...usuarioActualizado }
          : item
      )
    );
    setExito(`Rol de “${usuarioActualizado.nombre_usuario}” actualizado correctamente.`);
  };

  const rows = filtrados.map((item) => {
    const esUnoMismo = item.id_usuario === usuarioActual?.id_usuario;

    return {
      cells: [
        <span key="id" className="text-zinc-400">
          {item.id_usuario}
        </span>,
        <div key="usuario" className="flex flex-col">
          <span className="font-medium text-white">{item.nombre_usuario}</span>
          {esUnoMismo && (
            <span className="text-[11px] text-amber-300">Su cuenta</span>
          )}
        </div>,
        <span key="correo" className="text-zinc-300">
          {item.correo}
        </span>,
        <RolBadge key="rol" rol={item.rol} />,
        <EstadoBadge key="estado" estado={item.estado} />,
        <span key="fecha" className="text-zinc-400">
          {formatFecha(item.fecha_creacion)}
        </span>,
        <div key="acciones" className="flex flex-wrap items-center gap-1.5">
          <Link href={`/usuarios/${item.id_usuario}`}>
            <Button variant="ghost" size="sm">
              Ver
            </Button>
          </Link>
          <Link href={`/usuarios/${item.id_usuario}/editar`}>
            <Button variant="ghost" size="sm">
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUsuarioRol(item)}
          >
            Rol
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setUsuarioEliminar(item);
            }}
            disabled={esUnoMismo}
            title={esUnoMismo ? "No puede eliminar su propia cuenta" : "Eliminar usuario"}
          >
            Eliminar
          </Button>
        </div>,
      ],
    };
  });

  if (cargando && usuarios.length === 0) {
    return <PageLoader label="Cargando usuarios..." />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Cree cuentas, asigne roles y administre el acceso al sistema.
            Solo el Administrador puede acceder a este módulo.
          </p>
        </div>
        <Button onClick={() => setModalCrear(true)}>Nuevo usuario</Button>
      </div>

      {exito && (
        <Alert variant="success" onDismiss={() => setExito(null)} showDismiss>
          {exito}
        </Alert>
      )}

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
          {error}
        </Alert>
      )}

      <div className="grid gap-3 rounded-lg border border-zinc-800 bg-[#111827] p-4 sm:grid-cols-3">
        <Input
          label="Buscar"
          name="busqueda"
          placeholder="Usuario, correo o ID..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
        <Select
          label="Rol"
          name="filtroRol"
          value={filtroRol}
          onChange={(event) => setFiltroRol(event.target.value)}
        >
          <option value="">Todos los roles</option>
          {ROLE_OPTIONS.map((rol) => (
            <option key={rol.value} value={rol.value}>
              {rol.label}
            </option>
          ))}
        </Select>
        <Select
          label="Estado"
          name="filtroEstado"
          value={filtroEstado}
          onChange={(event) => setFiltroEstado(event.target.value)}
        >
          <option value="">Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#111827] p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {filtrados.length} de {usuarios.length} usuarios
          </span>
          {cargando && <span>Actualizando...</span>}
        </div>

        <Table
          headers={["ID", "Usuario", "Correo", "Rol", "Estado", "Creado", "Acciones"]}
          rows={rows}
          emptyMessage="No hay usuarios que coincidan con los filtros."
        />
      </div>

      {/* Crear usuario */}
      <Modal
        open={modalCrear}
        onClose={() => !creando && setModalCrear(false)}
        title="Nuevo usuario"
        size="lg"
      >
        <UsuarioForm
          modo="crear"
          roles={roles}
          onSubmit={crearUsuario}
          onCancel={() => !creando && setModalCrear(false)}
          loading={creando}
          error={formError}
          errores={formErrores}
        />
      </Modal>

      {/* Cambiar rol */}
      {usuarioRol && (
        <RolModal
          key={usuarioRol.id_usuario}
          open
          onClose={() => setUsuarioRol(null)}
          usuario={usuarioRol}
          roles={roles}
          onSaved={alCambiarRol}
        />
      )}

      {/* Eliminar usuario */}
      <Modal
        open={Boolean(usuarioEliminar)}
        onClose={() => !eliminando && setUsuarioEliminar(null)}
        title="Confirmar eliminación"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setUsuarioEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={eliminarUsuario} loading={eliminando}>
              Eliminar usuario
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteError && <Alert variant="error">{deleteError}</Alert>}
          <p>
            ¿Está seguro de eliminar al usuario{" "}
            <span className="font-medium text-white">
              {usuarioEliminar?.nombre_usuario}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <p className="text-xs text-zinc-500">
            Si el usuario tiene reservas u otros registros asociados, el backend
            rechazará la eliminación y mostrará el motivo.
          </p>
        </div>
      </Modal>
    </div>
  );
}
