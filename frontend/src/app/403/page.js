"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import RolBadge from "@/components/usuarios/RolBadge";

export default function AccesoDenegadoPage() {
  const { usuario, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#111827] p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l14.14 14.14" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-white">Acceso denegado</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Su usuario no tiene permisos para acceder a esta sección.
          Si cree que es un error, contacte al Administrador del sistema.
        </p>

        {usuario && (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm">
            <span className="text-zinc-300">{usuario.nombre_usuario}</span>
            <RolBadge rol={usuario.rol} />
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {usuario ? (
            <>
              <Link href="/">
                <Button>Volver al dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
