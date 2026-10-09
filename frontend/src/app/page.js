"use client";

import Link from "next/link";

export default function Home() {
  async function checkBackend() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      alert(`Backend OK: ${data.status || "OK"} - ${data.message || ""}`);
    } catch (err) {
      alert(`No se pudo conectar con el backend: ${err.message}`);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">🏨</span>
            <span className="text-lg font-semibold">Hotel Los Laureles</span>
          </div>
          <nav className="flex gap-3 text-sm font-medium">
            <Link href="/" className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700">
              Inicio
            </Link>
            <Link href="/habitaciones" className="rounded-md px-3 py-2 hover:bg-zinc-100">
              Habitaciones
            </Link>
            <Link href="/reservas" className="rounded-md px-3 py-2 hover:bg-zinc-100">
              Reservas
            </Link>
            <Link href="/auth" className="rounded-md px-3 py-2 hover:bg-zinc-100">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Bienvenido</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Sistema de gestión de reservas y habitaciones del hotel. La API está en
              <code>http://localhost:5000/api</code>.
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-lg font-semibold text-blue-900">Configuración rápida</h2>
            <ul className="mt-2 text-sm text-blue-800 list-disc list-inside">
              <li>Backend: <code>cd backend && npm run dev</code></li>
              <li>Frontend: <code>cd frontend && npm run dev</code></li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Estado del frontend</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Puedes comprobar la API desde el botón <em>Ver estado</em>.
            </p>
            <button
              type="button"
              className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              onClick={checkBackend}
            >
              Ver estado
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-zinc-500">
          Hotel Los Laureles &middot; Sistema de gestión &middot; Frontend en Next.js + Tailwind CSS
        </div>
      </footer>
    </main>
  );
}
