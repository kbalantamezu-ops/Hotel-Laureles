"use client";

// TODO(equipo): implementar el check-in del rol Recepcionista.
// Backend pendiente:
//   GET/POST /api/recepcion/checkins
//   GET /api/recepcion/checkins/:id
// Reglas: reserva existente y en estado válido, registrar realizado_por
// con el empleado del recepcionista autenticado y actualizar estados en
// una transacción.

import Link from "next/link";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Check-in</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Espacio exclusivo del rol Recepcionista.
        </p>
      </div>

      <Alert variant="warning">
        Módulo pendiente de implementación por el equipo. La ruta, el menú y el
        middleware de rol ya están aplicados en el backend.
      </Alert>

      <Card className="p-6">
        <h2 className="text-lg font-medium text-white">Alcance previsto</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• Buscar la reserva por ID o documento del huésped.</li>
          <li>• Validar que la reserva esté confirmada y vigente.</li>
          <li>• Registrar el check-in en la tabla check_ins.</li>
          <li>• Cambiar la reserva a estado CHECKIN y la habitación a OCUPADA.</li>
          <li>• Guardar observaciones y el recepcionista que ejecutó la acción.</li>
          <li>• Impedir check-in duplicado o de reservas canceladas.</li>
        </ul>

        <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            TODO(equipo)
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Implementar en <code className="text-amber-300">backend/routes/recepcionRoutes.js</code>{" "}
            y sus controladores/modelos; luego construir el formulario y listado
            reales en esta página.
          </p>
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="secondary">Volver al dashboard</Button>
        </Link>
        <Link href="/recepcion/check-out">
          <Button variant="ghost">Ir a Check-out</Button>
        </Link>
      </div>
    </div>
  );
}
