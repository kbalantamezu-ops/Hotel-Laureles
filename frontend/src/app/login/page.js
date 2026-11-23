"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function destinoSeguro(valor) {
  if (typeof valor !== "string" || valor === "") return "/";
  // Solo rutas internas: evita redirecciones a otros dominios.
  if (!valor.startsWith("/") || valor.startsWith("//")) return "/";
  return valor;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuario, cargando, login } = useAuth();

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const destino = destinoSeguro(searchParams.get("redirect"));

  useEffect(() => {
    if (!cargando && usuario) {
      router.replace(destino);
    }
  }, [cargando, usuario, destino, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setErrores([]);

    if (!identificador.trim() || !password) {
      setError("Ingrese su usuario/correo y contraseña.");
      return;
    }

    setEnviando(true);
    try {
      await login(identificador.trim(), password);
      router.replace(destino);
    } catch (err) {
      if (err?.status === 401) {
        setError(err.message || "Credenciales inválidas.");
      } else if (err?.status === 0) {
        setError("No se pudo conectar con la API. Verifique que el backend esté activo.");
      } else {
        setError(err?.message || "No se pudo iniciar sesión.");
      }
      if (Array.isArray(err?.errors)) setErrores(err.errors);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-white">
            Hotel Los Laureles
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Inicie sesión para acceder al sistema de gestión.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#111827] p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <Alert variant="error" onDismiss={() => setError(null)} showDismiss>
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
              label="Usuario o correo"
              name="identificador"
              type="text"
              autoComplete="username"
              placeholder="admin.laureles"
              value={identificador}
              onChange={(event) => setIdentificador(event.target.value)}
              disabled={enviando}
              autoFocus
            />

            <div className="relative">
              <Input
                label="Contraseña"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={enviando}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((valor) => !valor)}
                className="absolute right-2 top-[34px] rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={enviando}
              disabled={enviando || cargando}
            >
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-5 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
            Acceso restringido al personal autorizado. Las cuentas son creadas
            por un Administrador.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Hotel Los Laureles · Sistema de gestión
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
