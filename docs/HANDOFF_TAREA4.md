# Handoff — Tarea 4: autenticación, autorización y gestión de usuarios

Rama de trabajo: `FRONTEND`

Este documento describe lo implementado, cómo probarlo y qué queda pendiente para
los dos compañeros del equipo. Las funcionalidades exclusivas de **Cliente** y
**Recepcionista** están dejadas como esqueletos delimitados con `TODO(equipo)`.

---

## 1. Alcance entregado

- Autenticación con **JWT de acceso + refresh token**.
- Contraseñas con **bcrypt** (`bcryptjs`). El hash nunca se devuelve al cliente.
- Middlewares de **autenticación**, **validación de rol** y **propiedad de recurso**.
- Gestión de usuarios **exclusiva del Administrador**: crear, listar, ver,
  actualizar, cambiar rol, restablecer contraseña y eliminar.
- Creación de cuentas **solo por Administrador** (no hay registro público).
- `seed` del primer administrador usando variables de entorno.
- Frontend con login, guard de rutas, menús por rol, renovación automática del
  token ante `401` (un solo reintento), logout y estados de carga/error/403/éxito.
- Funcionalidades exclusivas por rol:
  - **Administrador**: gestión de usuarios **y** CRUD de habitaciones + tipos de
    habitación.
  - **Cliente**: “Mis reservas” (esqueleto para el compañero 1).
  - **Recepcionista**: check-in / check-out (esqueleto para el compañero 2).

---

## 2. Autenticación y sesión

### Tokens

| Token | Secreto | Vida por defecto | Uso |
|---|---|---|---|
| Access | `JWT_ACCESS_SECRET` | `15m` | Rutas protegidas (`Authorization: Bearer …`) |
| Refresh | `JWT_REFRESH_SECRET` | `7d` | Solo `POST /api/auth/refresh` |

- Se usan **secretos distintos** y un claim `typ` (`access` / `refresh`). Por eso
  un refresh token enviado a una ruta protegida responde **401**, y un access
  token enviado a `/auth/refresh` también responde **401**.
- El logout es **stateless**: el backend no mantiene lista de revocación; el
  cliente borra access + refresh + usuario de `localStorage`.
- En cada petición autenticada el middleware vuelve a consultar al usuario en la
  base de datos, de modo que un usuario desactivado pierde acceso aunque su
  token siga vigente.

### Códigos HTTP

| Código | Significado |
|---|---|
| `401` | No autenticado: token ausente, inválido, expirado, de tipo incorrecto o usuario inactivo/inexistente. |
| `403` | Autenticado, pero sin rol o sin propiedad sobre el recurso. |
| `400` | Datos inválidos, duplicados o reglas de negocio (por ejemplo, quitarse el rol de admin). |
| `404` | El recurso no existe. |

### Frontend

- `src/lib/authStorage.js`: lectura/escritura de tokens y usuario en `localStorage`.
- `src/lib/api.js`: cliente centralizado.
  - Adjunta el access token automáticamente.
  - Ante `401` renueva con el refresh token y **reintenta una sola vez**.
  - Varias peticiones concurrentes comparten una única promesa de refresh
    (evita bucles y refrescos duplicados).
  - Si el refresh falla, limpia la sesión y emite el evento `hl:session-expired`.
- `src/components/auth/AuthProvider.jsx`: contexto de sesión (`login`, `logout`,
  `usuario`, `cargando`), valida la sesión contra `/auth/me` al montar.
- `src/components/auth/RequireAuth.jsx`: sin sesión redirige a
  `/login?redirect=…`; sin rol redirige a `/403`.
- `src/components/layout/AppShell.jsx`: decide roles permitidos por prefijo de
  ruta.
- `src/lib/roles.js`: nombres exactos de rol (`Administrador`, `Recepcionista`,
  `Cliente`) y estilos de badge.

> La UI oculta acciones no permitidas, pero **la autorización real siempre la
> aplica el backend**. Ocultar un botón no es un control de seguridad.

**Riesgo conocido:** guardar tokens en `localStorage` es vulnerable a XSS. Es
aceptable para el alcance académico y está documentado en `authStorage.js`.

---

## 3. Matriz de permisos

| Recurso / acción | Administrador | Recepcionista | Cliente |
|---|---|---|---|
| `/auth/login`, `/auth/refresh`, `/auth/logout` | público | público | público |
| `/auth/me` | ✔ | ✔ | ✔ |
| Usuarios (`/usuarios`, `/roles`) | ✔ completo | ✘ 403 | ✘ 403 |
| Tipos de habitación — leer | ✔ | ✔ | ✔ |
| Tipos de habitación — escribir | ✔ | ✘ 403 | ✘ 403 |
| Habitaciones — leer | ✔ | ✔ | ✔ |
| Habitaciones — escribir | ✔ | ✘ 403 | ✘ 403 |
| Reservas generales (`/reservas`) | ✔ | ✔ | ✘ 403 |
| Clientes — listar/crear/editar | ✔ | ✔ | ✘ 403 |
| Clientes — ver uno | ✔ | ✔ | solo el propio |
| Clientes — eliminar | ✔ | ✘ 403 | ✘ 403 |
| Mis reservas (`/mis-reservas`) | ✘ 403 | ✘ 403 | ✔ (esqueleto 501) |
| Check-in/check-out (`/recepcion/*`) | ✘ 403 | ✔ (esqueleto 501) | ✘ 403 |

---

## 4. Endpoints

### Autenticación (`backend/routes/authRoutes.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | `{ identificador, password }` → access + refresh + usuario |
| POST | `/api/auth/refresh` | refresh token | `{ refreshToken }` → nuevos tokens |
| GET | `/api/auth/me` | access | Usuario autenticado actual |
| POST | `/api/auth/logout` | público | Cierre lógico (el cliente borra tokens) |

### Usuarios (`backend/routes/usuarioRoutes.js`, solo Administrador)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar |
| GET | `/api/usuarios/:id` | Detalle |
| POST | `/api/usuarios` | Crear (`nombre_usuario`, `correo`, `password`, `rol` o `id_rol`, `estado`) |
| PUT | `/api/usuarios/:id` | Actualizar `nombre_usuario`, `correo`, `estado` |
| PATCH | `/api/usuarios/:id/rol` | Cambiar rol (`rol` o `id_rol`) |
| PATCH | `/api/usuarios/:id/password` | Restablecer contraseña (`password`) |
| DELETE | `/api/usuarios/:id` | Eliminar |

### Roles

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/roles` | Administrador (catálogo para formularios) |

### Protecciones añadidas a rutas existentes

| Ruta | Lectura | Escritura |
|---|---|---|
| `/api/tipos-habitacion` | autenticados | Administrador |
| `/api/habitaciones` | autenticados | Administrador |
| `/api/reservas` | Admin + Recepcionista | Admin + Recepcionista |
| `/api/clientes` | Admin + Recepcionista (detalle: también el cliente dueño) | Admin + Recepcionista (DELETE: solo Admin) |

### Esqueletos de funcionalidades exclusivas

| Método | Ruta | Rol | Estado |
|---|---|---|---|
| GET/POST | `/api/mis-reservas` | Cliente | `501` + `TODO(equipo)` |
| GET/PUT/DELETE | `/api/mis-reservas/:id` | Cliente | `501` + `TODO(equipo)` |
| GET/POST | `/api/recepcion/checkins` | Recepcionista | `501` + `TODO(equipo)` |
| GET | `/api/recepcion/checkins/:id` | Recepcionista | `501` + `TODO(equipo)` |
| GET/POST | `/api/recepcion/checkouts` | Recepcionista | `501` + `TODO(equipo)` |
| GET | `/api/recepcion/checkouts/:id` | Recepcionista | `501` + `TODO(equipo)` |

Los esqueletos **ya tienen** `authenticate` + `authorizeRoles` aplicados, así que
la seguridad por rol no debe relajarse al implementarlos.

---

## 5. Puesta en marcha

### Backend

1. Copiar `backend/.env.example` a `backend/.env` y completar:
   - `DATABASE_URL` (PostgreSQL local o en la nube)
   - `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` (valores largos y **distintos**)
   - `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
2. Instalar dependencias: `cd backend && npm install`
3. Crear el primer administrador: `npm run seed:admin`
   - Es idempotente: si el usuario ya existe, actualiza rol, correo, contraseña
     y estado.
   - La contraseña **no** se imprime ni se guarda en claro.
4. Levantar el servidor: `npm run dev` → `http://localhost:5000`

### Frontend

1. Copiar `frontend/.env.example` a `frontend/.env.local`.
2. Ajustar `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:5000/api`).
3. `cd frontend && npm install`
4. `npm run dev` → `http://localhost:3000`

El proyecto también incluye un proxy opcional en
`frontend/src/app/api/[...path]/route.js`; solo se usa si se apunta la API al
propio Next. No es obligatorio.

### Flujo manual recomendado

1. Entrar a `/` sin sesión → redirige a `/login`.
2. Iniciar sesión con el administrador creado por el seed.
3. Abrir `/usuarios`: crear un Recepcionista y un Cliente.
4. Cerrar sesión y entrar con el Recepcionista:
   - Ve Habitaciones en modo lectura (sin botones de crear/editar/eliminar).
   - `/usuarios` redirige a `/403`.
   - Los módulos de check-in/out muestran el aviso de pendiente.
5. Entrar con el Cliente:
   - Solo ve “Mis reservas” en el menú.
   - `/usuarios`, `/reservas`, `/clientes` redirigen a `/403`.
6. Verificar la renovación: en DevTools, borrar `hl.accessToken` y navegar; la
   app debe refrescar con `hl.refreshToken` sin cerrar la sesión.
7. Borrar también el refresh token y navegar; debe volver a `/login` sin bucles.

---

## 6. Comandos de verificación

```bash
cd frontend
npm run lint
npm run build

cd ../backend
node --check server.js     # o el archivo puntual que se modifique
npm run seed:admin
```

Verificaciones realizadas en esta entrega:

- `npm run lint` → sin errores.
- `npm run build` → compila y prerenderiza las 14 rutas correctamente.
- Pruebas de API reales: login, refresh, `401` vs `403`, refresh token rechazado
  en rutas protegidas, CRUD de usuarios, reglas anti-bloqueo (no quitarse el rol
  ni eliminarse a sí mismo), ownership de clientes, lectura de habitaciones por
  Recepcionista y `403` al intentar escribir.
- Prueba del flujo completo a través del proxy de Next (`/api/*`).

---

## 7. Pendiente para el compañero 1 — “Mis reservas” (Cliente)

Archivos a implementar:

- `backend/routes/misReservasRoutes.js` (ya montado en `server.js`)
- `backend/controllers/misReservasController.js` (nuevo)
- `backend/models/reservaModel.js` (reutilizar/ampliar consultas del cliente)
- `frontend/src/app/mis-reservas/page.js` (reemplazar el placeholder)

Reglas obligatorias:

1. El `id_cliente` se deriva del usuario autenticado
   (`usuarios.id_usuario → clientes.id_usuario`); **nunca** se acepta del body.
2. Para ver/editar/cancelar una reserva validar la cadena
   `reserva → cliente → id_usuario`. Se puede reutilizar `isOwner` de
   `backend/middlewares/auth.js`.
3. Un cliente jamás puede leer ni modificar reservas de otro (responder `403`).
4. Al crear, la reserva nace en estado `PENDIENTE`; cancelar la pasa a
   `CANCELADA`. No puede hacer check-in/check-out.
5. Mantener los middlewares existentes (`authenticate` +
   `authorizeRoles(ROLES.CLIENTE)`).
6. Validar fechas (`fecha_salida > fecha_entrada`), huéspedes (`> 0`) y
   habitación existente; manejar `23503/23505` con `400` claro.
7. En el frontend: listado, formulario de creación, detalle y cancelación, con
   estados de carga, error y vacío. No mostrar acciones no permitidas.

Criterios de aceptación:

- Cliente A ve solo sus reservas; al pedir la de B recibe `403`.
- Admin/Recepcionista no acceden a `/api/mis-reservas` (siguen en `403`).
- El listado y las acciones funcionan sin exponer datos de otros clientes.

---

## 8. Pendiente para el compañero 2 — Check-in / Check-out (Recepcionista)

Archivos a implementar:

- `backend/routes/recepcionRoutes.js` (ya montado en `server.js`)
- `backend/controllers/recepcionController.js` (nuevo)
- `backend/models/checkInModel.js` y `backend/models/checkOutModel.js` (nuevos)
- `frontend/src/app/recepcion/check-in/page.js` y
  `frontend/src/app/recepcion/check-out/page.js` (reemplazar placeholders)

Reglas obligatorias:

1. Las tablas `check_ins` y `check_outs` ya existen en el script de base de datos;
   revisar sus columnas y llaves foráneas antes de escribir las consultas.
2. El check-in exige una reserva existente en estado válido (por ejemplo
   `CONFIRMADA`), sin check-in previo.
3. `realizado_por` debe salir del recepcionista autenticado
   (`usuarios.id_usuario → empleados.id_usuario`), no del body.
4. El check-out exige un check-in previo y la reserva en estado `CHECKIN`.
5. Actualizar en una **transacción**: reserva (`CHECKIN`/`CHECKOUT`) y habitación
   (`OCUPADA`/`DISPONIBLE`) de forma coherente.
6. Impedir duplicados (`23505`) y responder `400` claro ante
   `23503/23001/23505`.
7. En el frontend: buscar reserva, mostrar datos, confirmar acción, listar
   check-ins/check-outs y mostrar errores del backend.
8. Mantener `authenticate` + `authorizeRoles(ROLES.RECEPCIONISTA)`. El
   Administrador no ejecuta check-in/out (sigue en `403`).

Criterios de aceptación:

- Recepcionista registra check-in y la habitación queda `OCUPADA`.
- No se puede hacer check-out sin check-in, ni duplicar acciones.
- Cliente y Administrador reciben `403` en `/api/recepcion/*`.
- Reserva y habitación quedan consistentes si una operación falla.

---

## 9. Decisiones y limitaciones

- **JWT stateless** sin tabla de refresh tokens: no hay revocación inmediata por
  token; sí se corta el acceso si el usuario se desactiva o elimina, porque el
  middleware consulta la base de datos.
- **localStorage** para tokens: simple y compatible con el cliente HTTP actual,
  pero expuesto a XSS. No se usa `httpOnly` cookie porque el alcance pedido era
  JWT + cliente SPA.
- **Sin auto-registro**: las cuentas solo las crea un Administrador.
- **Reglas anti-bloqueo**: un admin no puede quitarse su propio rol, desactivarse,
  eliminarse, ni dejar el sistema sin administradores activos.
- El frontend oculta acciones por rol, pero el backend es la fuente de verdad.
- Los esqueletos responden `501` de forma intencional para que el equipo los
  complete sin romper la seguridad ya configurada.

---

## 10. Archivos principales

### Backend

- `config/roles.js`, `utils/jwt.js`, `utils/password.js`
- `middlewares/auth.js`
- `models/rolModel.js`, `models/usuarioModel.js`
- `controllers/authController.js`, `controllers/usuarioController.js`,
  `controllers/rolController.js`
- `routes/authRoutes.js`, `routes/usuarioRoutes.js`, `routes/rolRoutes.js`
- `routes/misReservasRoutes.js`, `routes/recepcionRoutes.js` (esqueletos)
- `routes/clienteRoutes.js`, `routes/habitacionRoutes.js`,
  `routes/reservaRoutes.js`, `routes/tiposHabitacionRoutes.js` (protecciones)
- `scripts/seedAdmin.js`, `server.js`, `.env.example`, `package.json`

### Frontend

- `src/lib/authStorage.js`, `src/lib/api.js`, `src/lib/roles.js`,
  `src/lib/format.js`
- `src/components/auth/AuthProvider.jsx`, `src/components/auth/RequireAuth.jsx`
- `src/components/layout/AppShell.jsx`, `src/components/layout/AppLayout.jsx`
- `src/components/ui/PageLoader.jsx`
- `src/components/usuarios/*` (formulario, badges y modales)
- `src/app/login/page.js`, `src/app/403/page.js`, `src/app/page.js`
- `src/app/usuarios/page.js`, `src/app/usuarios/[id]/page.js`,
  `src/app/usuarios/[id]/editar/page.js`
- `src/app/mis-reservas/page.js`, `src/app/recepcion/check-in/page.js`,
  `src/app/recepcion/check-out/page.js` (placeholders)
- `src/app/api/[...path]/route.js` (proxy opcional)
- `.env.example`

---

## 11. Pendientes de entrega (equipo)

- Documento PDF con la explicación de la tarea.
- Video de **máximo 15 minutos** mostrando el flujo real.
- ZIP del proyecto **sin** `node_modules`, sin `.next` y sin archivos `.env`
  reales (solo `.env.example`).
- No hacer push ni merge a `main` desde esta rama.
