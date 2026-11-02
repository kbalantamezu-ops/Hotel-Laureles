# Pantalla de mantenimiento — plantilla general

Se usa para:
- Tipos de habitación (`/tipos-habitacion`)
- Habitaciones (`/habitaciones`)
- Reservas (`/reservas`)
- Clientes (`/clientes`)

## Estructura de rutas (acordada)

- `/<recurso>` — listado
- `/<recurso>/nuevo` — crear
- `/<recurso>/[id]` — detalle
- `/<recurso>/[id]/editar` — editar
- Eliminar se hace desde el listado o desde detalle, con modal de confirmación

Ejemplo: `/reservas`, `/reservas/nuevo`, `/reservas/1`, `/reservas/1/editar`.

## Layout común

Encabezado de página:
- Título grande del recurso (ej "Reservas").
- Subtítulo corto ("Lista de reservas registradas.")
- Botón primario derecho: "Nuevo" cuando se está en listado.

## Listado (page principal del recurso)

- Tabla completa con columnas definidas por recurso.
- Barra superior: búsqueda por texto opcional + filtros opcionales (ej estado).
- Acciones por fila: ver detalle, editar, eliminar.
- Estado vacío: si no hay datos, mostrar mensaje y botón "Crear el primero".
- Carga inicial: placeholder de tabla o skeleton.

## Crear / Editar

- Breadcrumb simple (ej "Reservas > Nuevo").
- Título: "Nueva reserva" o "Editar reserva".
- Formulario con campos según recurso.
- Campos con label + input/select/textarea + mensaje de error por campo cuando exista.
- Botones abajo: "Cancelar" (secundario) y "Guardar" (primario dorado).
- Mientras se envía: botón en estado loading y formulario deshabilitado.
- Error del backend: Alert rojo con mensaje y lista de errores si viene `errores[]`.
- Éxito: Alert verde breve y navegación al listado.

## Detalle

- Título con nombre/identificador del registro.
- Tarjetas o lista de campos con label + valor.
- Acciones derecho o inferior: editar, eliminar, volver al listado.
- Si el recurso tiene datos relacionados (ej reserva con cliente/habitación), se puede mostrar info extra o solo mostrar los IDs con descripción si está disponible.

## Eliminar (modal)

- No es página nueva, es modal sobre el listado o detalle.
- Título: "Eliminar registro".
- Mensaje claro: "¿Estás seguro de eliminar X? Esta acción no se puede deshacer."
- Botones: "Cancelar" y "Eliminar" (primario en tono rojo/dorado según acorde, pero de riesgo).
- Mientras elimina: loading en botón.
- Errores: Alert rojo.
- Éxito: cerrar modal y refrescar listado.

## Estilos

- Fondo página: oscuro sutil.
- Tabla: encabezado con fondo `#111827`, filas alternate sutil, bordes inferiores.
- Botón primario: dorado (`#d4af37`) con texto negro.
- Botón secundario: borde dorado/transparente con texto clarito.
- Campo formulario: fondo `#1f2937`, borde `#374151`, focus con dorado.
- Alert éxito: verde muy sutil; alert error: rojo sutil.

## Nota de usar componentes

Este layout debe montarse con los componentes de `src/components/ui/` (Table, Button, Modal, Alert, campos formulario).
