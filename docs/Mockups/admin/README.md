# Mockups de referencia — Panel de gestión (admin)

Este folder es de referencia para el **frontend** de esta tarea: dashboard + mantenimientos de las 4 tablas.

## 1) Qué ya existen (sitio cliente / Público)

Los mockups de `../cliente/` son del sito externo del hotel (landing, suites y flujo de reserva client-facing). Sirven para copiar **identidad visual** (tono oscuro + acentos dorados) y branding, pero **no** son la interfaz de este panel.

- `01-landing.png` — landing de bienvenida del hotel
- `02-suites-rooms.png` — sección de suites y habitaciones (tarjetas con precio)
- `03-reserva-datos-huesped.png` — paso de datos del huésped principal
- `04-reserva-servicios-pago.png` — servicios extra + resumen + pago

## 2) Panel administrativo (lo que construimos ahora)

La imagen de referencia del dashboard y de los mantenimientos está en este mismo folder como archivo markdown (`dashboard.md`, `mantenimiento.md`), porque al inicio no tenemos capturas reales. El equipo puede:

1. Usar ese markdown como guía de layout (filas, columnas, botones, estados).
2. Reemplazarlo después con capturas reales una vez que la app esté lista.

## 3) Identidad visual acordada

- Fondo general: tono oscuro (tipo `#0b1120` / `#0a0f1c`), no blanco.
- Paneles/cards: ligeramente más claro (`#111827` / `#141a29`) con borde sutil.
- Acento principal: dorado/ámbar (`#d4af37` o `#e5c158`), usado en botones primarios, badges y detalles, no en fondo.
- Texto: blanco/off-white para contenido, gris claro para secundario.
- Tipografía: mantener la configuración base del proyecto (Geist para interfaces) y usar serif solo en títulos de marca si se quiere, pero de forma moderada en panel admin.
- Bordes: redondeo moderado (8px a 12px), sombras ligeras en paneles flotantes.

## 4) Capturas pendientes

Una vez listo el dashboard y al menos un mantenimiento completo, tomar capturas y ponerlas aquí con nombre claro, ej:

```
admin/dashboard.png
admin/tipos-habitacion-listado.png
admin/tipos-habitacion-crear.png
admin/habitaciones-listado.png
...
```

Esto sirve para el entregable/revisión de la tarea.
