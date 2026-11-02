# Dashboard — Área de trabajo

Ruta: `/`

## Layout general

- Navbar lateral izquierda (fix, altura full).
- Contenido principal a la derecha con padding y scroll.
- Encabezado superior dentro del área principal: título "Área de trabajo" + indicador de estado del backend pequeño (opcional).

## Navbar lateral

- Logo/identidad en la parte superior:
  - Ícono tipo laurel/corona estilo marca del hotel (según mockups cliente) o initiales "HL".
  - Nombre: "Hotel Los Laureles".
  - Subtítulo pequeño: "Panel de gestión".
- Sección de navegación con items:
  - Dashboard (resaltado cuando estamos en `/`).
  - Tipos de habitación → `/tipos-habitacion`
  - Habitaciones → `/habitaciones`
  - Reservas → `/reservas`
  - Clientes → `/clientes`
- Pie del sidebar con texto secundario pequeño: "Frontend Next.js + Tailwind" o palabra "Desarrolladores: equipo T3".

### Estilo del sidebar
- Fondo panel: `#111827`
- Bordes derecha sutiles
- Item activo: fondo dorado sutil o borde izquierda dorado + texto dorado
- Hover: fondo `#1f2937`

## Área principal (contenido)

### Encabezado
- Título: "Área de trabajo"
- Subtítulo secundario: "Bienvenido al panel de gestión del hotel."

### Grid de tarjetas rápidas (estado del sistema)

Tarjetas en grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` con tarjetas tipo:
1. Tipos de habitación — total de tipos
2. Habitaciones — total de habitaciones
3. Reservas — total de reservas (o contador rápido)
4. Clientes — total de clientes

Cada tarjeta:
- Título pequeño en gris (ej "Tipos de habitación")
- Número grande en blanco/dorado
- Badge de estado opcional (ej "OK" verde si la API respondió)

Debajo de las tarjetas:
- Sección "Accesos rápidos" con botones/grupos que enlazan a cada mantenimiento.
- Opcional: última verificación de conexión al backend con fecha/hora.

## Estados
- Si la API no responde: mostrar alerta/estado "No se pudo consultar el backend" y seguir mostrando el dashboard con valores vacíos o con placeholder.
- Mientras carga: tarjetas en estado loading (placeholder/skeleton simple).

## Nota de estilo
No copiar el flujo de reserva client-facing (formulario, elegancia de landing). Aquí el estilo es **panel de gestión funcional**, pero con identidad oscura+dorada para que cuadre con el resto del proyecto.
