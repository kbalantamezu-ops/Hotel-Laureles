# Guía del equipo — Frontend del panel de gestión (Tarea 3)

Esta guía sirve para que el grupo continúe el trabajo sobre la base que ya
está lista en esta rama `FRONTEND`.

Está escrita para que la entienda cualquier persona y también para que una IA
pueda seguirla sin ambigüedades.

---

## 1) Estado actual del proyecto

Esta sección responde primero las dos preguntas más importantes:
¿qué ya funciona? y ¿qué falta por hacer?

### Qué ya está funcionando

- **Backend completo con 4 tablas**, conectado a Neon y con datos reales:
  - `tipos_habitacion` → `/api/tipos-habitacion`
  - `habitaciones` → `/api/habitaciones`
  - `reservas` → `/api/reservas`
  - `clientes` → `/api/clientes`
  - Health: `GET /api/health`
- **Frontend listo**, con Next.js 16 + React 19 + Tailwind CSS v4:
  - `src/lib/api.js` → capa centralizada para consumir la API.
  - `src/lib/constants.js` → nombres de recursos, títulos y mensajes comunes.
  - Layout con sidebar y dashboard en `/`.
  - Rutas creadas para las 4 secciones.
  - Un mantenedor completo de ejemplo: **Tipos de habitación**.
  - Componentes UI reutilizables en `src/components/ui/`.
  - API route de proxy en `src/app/api/[...path]/route.js`.

### Qué significa “está funcionando”

Si levantas ambos servicios, el frontend puede consultar la API sin problemas:

- Backend levantado: `http://localhost:5000/api/health`
- Frontend levantado: `http://localhost:3000`
- Frontend proxyeando a la API: `http://localhost:3000/api/health`

Los 4 recursos se pueden consultar desde el frontend así:

```bash
curl http://localhost:3000/api/tipos-habitacion
curl http://localhost:3000/api/habitaciones
curl http://localhost:3000/api/reservas
curl http://localhost:3000/api/clientes
```

### Qué falta por hacer

Lo que falta es completar **detalle y edición** de los mantenedores que aún
no los tienen.

| Recurso | Listado | Detalle | Editar | Formulario | Estado |
|---|---|---|---|---|---|
| Tipos de habitación | listo | listo | listo | listo | completo |
| Habitaciones | listo | pendiente | pendiente | listo | falta detalle/editar |
| Reservas | listo | pendiente | pendiente | listo | falta detalle/editar |
| Clientes | listo | pendiente | pendiente | listo | falta detalle/editar |

### Qué le toca a cada uno

Pueden repartirse como acuerden, pero esta separación evita choque de archivos:

- **Capa base + layout + dashboard + componentes UI + guía**: ya está listo.
- **Un mantenedor por persona**:
  - Habitaciones → completar detalle y edición.
  - Reservas → completar detalle y edición.
  - Clientes → completar detalle y edición.

Si alguien va a tocar un archivo que otra persona también va a tocar, tienen
que coordinarse primero.

---

## 2) Cómo se comunica el frontend con el backend

El frontend funciona como app standalone en `http://localhost:3000`.

Para que la página principal y los mantenedores puedan consumir la API sin
depender de CORS en el navegador, el frontend tiene una API route de proxy:

- `frontend/src/app/api/[...path]/route.js`

Cuando el frontend hace fetch a `/api/tipos-habitacion`, Next.js proxyea la
petición al backend `http://localhost:5000/api/tipos-habitacion` y devuelve
la respuesta.

Por eso el frontend se configura con un solo archivo de entorno local:

- `frontend/.env.local` debe tener:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=3000
```

El archivo de plantilla oficial del proyecto es:

- `frontend/.env.example`

Ese es el único archivo `.env` que se puede usar como referencia en el
repositorio. No debe existir otro `.env` commitado.

> **Regla importante:**
> Nunca hardcodees `http://localhost:5000/api` dentro de los componentes.
> Usa siempre la capa centralizada `src/lib/api.js`.

---

## 3) Antes de empezar a codificar

1. Levanta el backend:

```bash
cd backend
npm install
npm run dev
```

El backend debe quedar disponible en `http://localhost:5000/api/health`.

2. Levanta el frontend desde otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:3000`.

3. Verifica que ambos están vivos:

```bash
curl http://localhost:5000/api/health
curl http://localhost:3000/api/health
```

Ambos deben responder. El segundo confirma que el proxy del frontend está
funcionando.

---

## 4) Estructura de carpetas acordada

```
frontend/src/
├── app/
│   ├── layout.js                   # layout raíz (sidebar + metas)
│   ├── page.js                     # dashboard (/)
│   ├── api/
│   │   └── [...path]/route.js      # proxy al backend
│   ├── tipos-habitacion/
│   │   ├── page.js                 # listado
│   │   ├── [id]/page.js            # detalle
│   │   └── [id]/editar/page.js     # edición
│   ├── habitaciones/
│   ├── reservas/
│   └── clientes/
├── components/
│   ├── ui/                         # Button, Modal, Alert, Table, Input, Select,
│   │                               # Textarea, Card, EmptyState, SkeletonCard
│   └── <recurso>/                  # componente de formulario del recurso
└── lib/
    ├── api.js                      # fetch centralizado
    └── constants.js                # constantes compartidas
```

---

## 5) Cómo consumir la API

Usa siempre la capa centralizada. Ejemplo:

```js
import { api } from "../../lib/api";

const tipos = await api.tiposHabitacion.lista();
const tipo = await api.tiposHabitacion.porId(1);
await api.tiposHabitacion.crear({ nombre: "Suite", capacidad: 4, precio_noche: 50000 });
await api.tiposHabitacion.actualizar(id, datos);
await api.tiposHabitacion.eliminar(id);
```

La función `apiFetch` lanza un `Error` cuando el backend responde 4xx o 5xx.
Tú tienes que capturar ese error para mostrar `Alert` o un estado de carga o
error en la UI.

---

## 6) Convenciones visuales

- Tema oscuro con acentos dorados para que cuadre con el branding del hotel.
- Botón primario: dorado (`#d4af37`) con texto oscuro.
- Fondo del panel: `#111827`, sidebar: `#111827` con borde derecho sutil.
- Tablas: encabezado oscuro, filas alternas sutiles, bordes inferiores.
- Estado vacío: usar `EmptyState` con mensaje claro + botón crear.
- Cargas: `SkeletonCard` o placeholder `h-8 animate-pulse`.
- Errores: `Alert variant="error"`.
- Éxito: `Alert variant="success"` y breve.

---

## 7) Plantilla de mantenedor por recurso

Cada recurso debe tener estas 5 pantallas:

1. **Listado**: `/recurso/page.js`
   - Tabla con columnas del recurso.
   - Botón “Nuevo” arriba a la derecha.
   - Carga inicial con skeleton o alerta si falla.
   - Acciones por fila: ver, editar, eliminar.
   - Eliminar → modal de confirmación → llamada API → recargar listado.
2. **Crear**: modal desde el listado o página `/recurso/nuevo/`
   - Formulario reutilizable del recurso.
   - Submit → `api.<recurso>.crear(...)` → si éxito, cerrar y recargar.
   - Mostrar el error del backend si ocurre.
3. **Detalle**: `/recurso/[id]/page.js`
   - Título + campos del registro.
   - Botones: editar, volver al listado.
4. **Editar**: `/recurso/[id]/editar/page.js`
   - Carga primero el registro y llena el formulario.
   - Submit → `api.<recurso>.actualizar(id, datos)`.
   - Botón “Restaurar” para volver a los valores originales.
5. **Eliminar**: siempre con modal de confirmación, nunca con una ruta nueva.

---

## 8) Ejemplo real copiable

El mantenedor completo de referencia es el de **Tipos de habitación**:

- `src/app/tipos-habitacion/page.js`
- `src/app/tipos-habitacion/[id]/page.js`
- `src/app/tipos-habitacion/[id]/editar/page.js`
- `src/components/tipos-habitacion/TipoHabitacionForm.jsx`

Para replicar otro recurso, copien esa estructura y cambien:

- nombre del recurso en imports y rutas,
- campos del formulario y de la tabla,
- payload de las llamadas a la API.

---

## 9) Qué hacer en cada mantenedor pendiente

Para habitaciones, reservas y clientes, el trabajo pendiente es:

- Crear la página de detalle: `/recurso/[id]/page.js`
- Crear la página de edición: `/recurso/[id]/editar/page.js`
- Que cada acción use `api.<recurso>.<metodo>`
- Que el formulario maneje loading, error y éxito
- Que la eliminación use modal de confirmación

Las listas y los formularios ya existen como base. Lo que falta es detalle
y edición con la misma estructura del ejemplo completo.

---

## 10) Verificación después de cada cambio

1. Compila el frontend:

```bash
cd frontend
npm run build
```

Debe salir sin errores de ruta o importación.

2. Revisa que la página renderiza en desarrollo:

```bash
cd frontend
npm run dev
```

Desde otra terminal.

3. Si agregas un recurso nuevo, entra en:

- `/recurso`
- `/recurso/nuevo`
- `/recurso/id`
- `/recurso/id/editar`

---

## 11) Verificación rápida con curl

Antes de decir que un mantenedor funciona, verifica que el frontend puede
consultar la API a través del proxy. No basta con consultar el backend
directo.

```bash
# Backend directo
curl http://localhost:5000/api/health
curl http://localhost:5000/api/tipos-habitacion

# Frontend proxy
curl http://localhost:3000/api/health
curl http://localhost:3000/api/tipos-habitacion
curl http://localhost:3000/api/habitaciones
curl http://localhost:3000/api/reservas
curl http://localhost:3000/api/clientes
```

El frontend debe responder con los mismos datos que el backend en
`/api/health`, `/api/tipos-habitacion`, `/api/habitaciones`,
`/api/reservas` y `/api/clientes`.

---

## 12) Referencias de diseño

- Mockups de referencia del panel administrativo: `docs/Mockups/admin/`
- Mockups del sitio cliente: `docs/Mockups/cliente/`
- Documentación base del frontend: `frontend/README.md`
- Documentación base del backend: `backend/README.md`
