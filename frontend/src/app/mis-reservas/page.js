"use client";

// TODO(equipo): implementar la funcionalidad exclusiva del rol Cliente.
// Backend pendiente:
//   GET/POST /api/mis-reservas
//   GET/PUT/DELETE /api/mis-reservas/:id
// Reglas: el id_cliente se deriva del usuario autenticado y se valida
// propiedad (reserva -> cliente -> id_usuario) antes de modificar.

import Link from "next/link";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function MisReservasPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mis reservas</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Espacio exclusivo del rol Cliente.
        </p>
      </div>

      <Alert variant="warning">
        Módulo pendiente de implementación por el equipo. La ruta, el menú y el
        control de acceso por rol ya están preparados.
      </Alert>

      <Card className="p-6">
        <h2 className="text-lg font-medium text-white">Alcance previsto</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• Listar únicamente las reservas del cliente autenticado.</li>
          <li>• Crear una reserva propia seleccionando habitación y fechas.</li>
          <li>• Consultar el detalle de una reserva propia.</li>
          <li>• Modificar fechas/cantidad de huéspedes según reglas del hotel.</li>
          <li>• Cancelar una reserva propia.</li>
          <li>• Rechazar con 403 cualquier acceso a reservas de otro cliente.</li>
        </ul>

        <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            TODO(equipo)
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Implementar en <code className="text-amber-300">backend/routes/misReservasRoutes.js</code>,{" "}
            <code className="text-amber-300">backend/controllers/</code> y{" "}
            <code className="text-amber-300">backend/models/</code>; luego reemplazar
            esta página por el listado, formulario y detalle reales.
          </p>
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="secondary">Volver al dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
