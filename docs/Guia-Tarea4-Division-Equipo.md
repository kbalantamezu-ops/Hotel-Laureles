# Tarea 4 — Guía de división del trabajo

**Proyecto:** Hotel Los Laureles
**Asignatura:** Programación V (S641A)
**Documento fuente:** `Tarea4_prog5_202602.pdf`
**Integrantes:** Santiago Niño · Holman David Arrahondo · Leonardo Angel · Kevin Andres Balanta

> Esta guía reparte la Tarea 4 en **4 partes**, una por integrante, con tareas concretas,
> archivos que cada uno toca y criterios de "terminado". El reparto por nombre es una
> propuesta: si el grupo prefiere intercambiar partes, solo deben respetar las
> dependencias de la sección 7.
>
> **Santiago abre la Parte 1** porque deja las bases de autenticación que necesitan los
> demás módulos. El orden 1 → 4 es el orden sugerido de ejecución.

---

## 1. Qué pide la tarea (resumen)

La Tarea 4 **no** pide terminar toda la aplicación. Pide:

1. **Autenticación con JWT**: login, `access token` de vida corta y `refresh token` usado
   solo para renovar. Contraseñas con **bcrypt** (nunca en texto plano ni en respuestas).
2. **Autorización en el backend**: middlewares que verifiquen autenticación, rol y
   propiedad del recurso. Responder **401** si no está autenticado y **403** si está
   autenticado pero no tiene permiso.
3. **Configuración por variables de entorno**: secretos JWT, expiraciones, conexión a
   PostgreSQL, URL del API en el frontend.
4. **Gestión de usuarios completa** (crear, listar, consultar, actualizar, cambiar rol,
   eliminar) restringida al rol administrador, más un **seed del primer usuario**.
5. **Una funcionalidad exclusiva completa por rol** (base de datos + endpoints +
   validaciones + interfaz). La gestión de usuarios **no** cuenta como la funcionalidad
   exclusiva del administrador: el admin necesita además una funcionalidad de negocio.
6. **Frontend protegido**: login, guardas de rutas, menús según rol, manejo de tokens y
   renovación, cierre de sesión, estados de carga/error.
7. **Entregables**: un único ZIP en Teams con código (sin `node_modules`), scripts de BD,
   informe PDF y video de máximo 15 minutos.

### Roles del proyecto y funcionalidad exclusiva propuesta

| Rol | Funcionalidad exclusiva | Permisos del rol propietario | Permisos de los demás roles |
|---|---|---|---|
| **Cliente** | Gestionar los huéspedes acompañantes de sus propias reservas | Crear, consultar y eliminar acompañantes solo en reservas propias | Recepcionista y Administrador: solo consulta. Otros clientes: sin acceso |
| **Recepcionista** | Registrar check-in y check-out de las reservas | Crear check-in/check-out, actualizar estado de reserva y habitación | Administrador: solo consulta. Cliente: sin acceso (solo ve el estado de su reserva) |
| **Administrador** | Gestionar habitaciones y tipos de habitación (precios y disponibilidad) | Crear, listar, editar y eliminar habitaciones y tipos | Cliente y Recepcionista: solo consulta |

> Esta tabla es la que va en el informe (sección 3.3 del PDF). Si el grupo cambia una
> funcionalidad, debe cambiarla también aquí y en el informe.

**Modalidad de creación de usuarios recomendada:** *creación por parte del administrador*.
No habrá autorregistro público, así se evita el riesgo de que alguien se asigne un rol
administrativo. Debe quedar escrito en el informe.

---

## 2. Punto de partida del repositorio

Antes de repartir, esto es lo que ya existe (para no duplicar trabajo):

| Área | Estado actual |
|---|---|
| Frontend | Next.js 16 con CRUDs visuales de clientes, habitaciones, tipos de habitación y reservas. `frontend/src/lib/api.js` centraliza los `fetch` **sin tokens**. |
| Backend | Express con CRUDs de clientes, habitaciones, tipos y reservas. La **Parte 1 está implementada y probada**: login, refresh, logout, `/me`, middlewares y seed; `server.js` monta `/api/auth` y protege las rutas existentes con `autenticar`. |
| Base de datos | `database/Script Hotel laureles.sql` ya crea `roles`, `usuarios` (con `password_hash`), `clientes`, `empleados`, `reservas`, `reserva_huespedes`, `check_ins`, `check_outs`, etc. |
| Sin implementar | CRUD de usuarios, guardas y menús por rol en el frontend, endpoints de acompañantes y de check-in/check-out. |

Consecuencia práctica: **la base de datos ya tiene casi todo**. Solo se agregará la tabla
de refresh tokens y, si hace falta, algún campo/índice.

**Estado de la Parte 1 (Santiago):** implementada y **probada de punta a punta** contra
PostgreSQL: login, refresh con rotación y concurrencia, logout, 401/403 y seed. La tabla
`refresh_tokens` ya está aplicada y los secretos JWT están en `backend/.env`. También
quedaron creados los usuarios de prueba de los tres roles; sus credenciales están en
`docs/Credenciales-Prueba.md`. Falta únicamente documentar la parte.

### 2.1 Estado por parte

| Parte | Estado | Qué falta exactamente |
|---|---|---|
| **1. Auth (Santiago)** | **Probado end-to-end** contra PostgreSQL | Solo falta documentar la parte. Usuarios de prueba de los tres roles creados; credenciales en `docs/Credenciales-Prueba.md`. |
| **2. Usuarios + admin (Holman)** | No iniciado | CRUD `/api/usuarios`, cambio de rol, hashes, reglas para no quedarse sin admin, proteger escritura de habitaciones/tipos, pantallas de usuarios y helpers en `api.js`. |
| **3. Frontend + cliente (Leonardo)** | No iniciado | `AuthContext`, login, interceptor de token/refresh, guardas, menús por rol, logout, endpoints y pantallas de acompañantes, reglas de reservas propias. |
| **4. Recepcionista + integración (Kevin)** | No iniciado | Check-in/check-out, reglas de reservas por rol, botones y pantallas, diagramas, informe, video y ZIP. |

> La Parte 1 solo dejó **autenticación** (quién eres). La **autorización por rol y
> propiedad** todavía no está aplicada en los CRUDs existentes: cualquier usuario
> autenticado puede escribir habitaciones, tipos, clientes y reservas hasta que las
> Partes 2–4 agreguen `autorizarRoles` y `autorizarPropietario`. No presentar el sistema
> como terminado antes de eso.

### 2.2 Lo que falta (inventario rápido)

**Base de datos y datos de prueba**
- [x] Aplicar `database/refresh_tokens.sql` en la base local (ya aplicada en la base actual).
- [x] Usuarios de prueba de los tres roles creados (administrador, recepcionista con fila en `empleados` y cliente con fila en `clientes`). Credenciales en `docs/Credenciales-Prueba.md`.
- [ ] Actualizar `database/datos_prueba.sql` (o crear otro seed) con esos usuarios y algunas reservas/habitaciones.

**Backend**
- [ ] Restricciones de rol y propiedad en todos los routers (hoy solo existe `autenticar`).
- [ ] CRUD de usuarios y cambio de rol (Parte 2).
- [ ] Endpoints de huéspedes acompañantes con validación de propiedad (Parte 3).
- [ ] Check-in/check-out y reglas de reservas por rol (Parte 4).
- [ ] Revisar que ninguna respuesta incluya `password_hash` (login, `/me`, usuarios).
- [ ] (Recomendado) manejador de errores JSON al final de `server.js` para no devolver HTML en un 500.

**Frontend**
- [ ] `apiFetch` todavía no envía `Authorization`; por eso las pantallas actuales reciben 401.
- [ ] Login, contexto de sesión, renovación, guardas, menús, logout y pantallas de los módulos.

**Documentación y entrega**
- [ ] Tabla de funcionalidades y de endpoints definitiva.
- [ ] Diagramas de BD final y casos de uso "cero".
- [ ] Informe PDF, video ≤ 15 min y ZIP sin `node_modules`.

### 2.3 Cuidados críticos (leer antes de tocar código)

1. **401 no es 403.** Sin token, token vencido o inválido → 401. Con token válido pero sin rol/permiso o recurso ajeno → 403. No mezclarlos.
2. **El refresh token es de un solo uso.** La Parte 1 lo rota en cada `/api/auth/refresh` con consumo atómico y un `jti` único (dos logins en el mismo segundo no colisionan). Si el frontend dispara dos renovaciones en paralelo, la segunda falla y cierra la sesión. Leonardo debe implementar **una sola renovación en curso** (promesa compartida) y no reintentar el propio `/refresh`.
3. **El access token no se guarda en `localStorage`.** Va en memoria (estado de React); el refresh sí puede ir en `localStorage`, como quedó decidido. Nunca guardar contraseñas.
4. **Nunca devolver `password_hash`.** `buscarPorCorreo` lo incluye solo para comparar con bcrypt; no lo propaguen a respuestas, logs ni mensajes de error.
5. **Contraseñas siempre con bcrypt.** El seed y el login ya lo usan; el CRUD de usuarios debe usar `bcrypt.hash` al crear y al cambiar contraseña.
6. **Secretos en `.env`.** `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` deben ser distintos y largos. Si cambian, todos los tokens emitidos dejan de servir. El `.env` real no se sube ni se incluye en el ZIP (solo `.env.example`).
7. **La base local necesita la migración.** Sin `refresh_tokens` el login falla al guardar el refresh. El seed solo crea el usuario admin: no crea clientes, empleados, habitaciones ni reservas.
8. **El seed exige `SEED_ADMIN_PASSWORD`.** Si falta, falla a propósito. No escriban la contraseña real en el código; documéntela en la guía de instalación o entréguenla aparte.
9. **`autorizarPropietario` usa `id_cliente` del token.** Solo sirve para recursos de clientes; Recepcionista/Administrador no tienen `id_cliente` y deben usar reglas de rol. Si el cliente cambia de fila en `clientes`, su token queda desactualizado: debe volver a iniciar sesión.
10. **Eliminar usuarios puede fallar por FKs.** `clientes`/`empleados` se borran en cascada, pero `reservas` y `check_ins` usan `ON DELETE RESTRICT`: hay que responder 400 con un mensaje claro, no 500.
11. **El check-in necesita `id_empleado`.** El recepcionista de prueba debe tener fila en `empleados`; `check_ins.realizado_por` apunta ahí. Si no existe, el insert falla.
12. **Ocultar botones no protege nada.** La validación real va en el backend; el frontend solo mejora la experiencia.
13. **CORS y puertos.** El backend solo acepta `http://localhost:3000` por defecto (`CORS_ORIGIN`). Si Next corre en otro puerto, ajusten la variable o el login fallará desde el navegador aunque Postman funcione.
14. **No editar archivos de otro dueño** (tabla 6.3) y no subir `node_modules` al ZIP.
15. **Credenciales de prueba.** Están en `docs/Credenciales-Prueba.md` y en `backend/.env`; son solo para desarrollo. No incluirlas en `.env.example` ni reutilizarlas en producción.

---

## 3. Decisiones que el grupo debe cerrar antes de programar

| Decisión | Propuesta para esta entrega |
|---|---|
| Modalidad de usuarios | Creación por administrador (sin autorregistro). |
| Funcionalidades exclusivas | Las de la tabla de la sección 1. |
| Tokens en el frontend | `accessToken` en memoria (estado de React) y `refreshToken` en `localStorage`. Al recargar la página, el contexto pide uno nuevo con `/api/auth/refresh`. |
| Formato de error del API | `{ mensaje: "texto", errores?: [] }`, igual que los CRUDs actuales. |
| Nombres de roles | Exactamente `Cliente`, `Recepcionista`, `Administrador` (como están en la tabla `roles`). |
| Puerto backend / frontend | `5000` / `3000`. |
| Ramas | Una rama por parte (`feature/auth-backend`, `feature/usuarios`, `feature/frontend-auth`, `feature/checkin-checkout`) y PR a la rama de integración. |
| Contrato de auth | Ya implementado en la Parte 1; no cambiarlo sin avisar a Leonardo (ver 6.4). |

> Si el grupo decide usar cookies `httpOnly` para el refresh token, hay que habilitar
> `cors({ credentials: true })` y `credentials: "include"` en `apiFetch`. Es más seguro,
> pero agrega trabajo; si se elige, debe quedar documentado.

---

## 4. División en 4 partes (resumen)

| Parte | Responsable | Módulo | Backend | Frontend | Documentación |
|---|---|---|---|---|---|
| **1** | Santiago Niño | Núcleo de autenticación y seguridad | bcrypt, login, access/refresh, middlewares, seed del primer usuario, `.env.example`, protección base de rutas | — | Arquitectura, mecanismo del primer usuario, guía de instalación del backend |
| **2** | Holman David Arrahondo | Gestión de usuarios + funcionalidad exclusiva del Administrador | CRUD `/api/usuarios`, cambio de rol, modelo de usuario, protección de habitaciones y tipos | Pantallas de usuarios + restricciones de administrador en habitaciones/tipos | Tabla de funcionalidades y tabla completa de endpoints |
| **3** | Leonardo Angel | Sesión en el frontend + funcionalidad exclusiva del Cliente | Endpoints de huéspedes acompañantes con validación de propiedad | Login, contexto de sesión, renovación, guardas, menús por rol, logout, pantallas de acompañantes | Roles y permisos, modalidad de usuarios, guía de instalación del frontend |
| **4** | Kevin Andres Balanta | Funcionalidad exclusiva del Recepcionista + integración de la entrega | Check-in/check-out y reglas de reservas por rol | Botones y pantallas de check-in/check-out en reservas | Diagramas BD y casos de uso "cero", compilación del informe, edición del video, ZIP |

---

## 5. Detalle por integrante

### Parte 1 — Santiago: núcleo de autenticación y seguridad

> **Estado:** implementado y **probado end-to-end** contra PostgreSQL (login, refresh, logout, 401/403 y seed). Pendiente la documentación y crear el admin real. Ver 2.1.

**Objetivo:** que exista un login real y que el backend sepa quién hace cada petición.

**Base de datos**
- [x] Agregar la tabla `refresh_tokens` (id, id_usuario FK, token_hash, expira_en, revocado, fecha_creacion) en un script nuevo dentro de `database/` y actualizar el script principal.
- [x] Verificar que los tres roles existen (el script ya los inserta).

**Backend** (`backend/middlewares/`, `backend/controllers/authController.js`, `backend/models/refreshTokenModel.js`, `backend/scripts/seedAdmin.js`)
- [x] bcrypt: `bcrypt.compare` en login y `bcrypt.hash` en el seed (el CRUD de usuarios lo completa la Parte 2).
- [x] Refresh token con `jti` único y consumo atómico: dos logins en el mismo segundo no colisionan y dos refresh simultáneos no pueden canjear el mismo token.
- [x] `POST /api/auth/login`: valida credenciales, devuelve `accessToken` (15 min), `refreshToken` (7 días) y los datos públicos del usuario (`id`, `nombre_usuario`, `correo`, `rol`). Nunca devolver `password_hash`.
- [x] `POST /api/auth/refresh`: recibe el refresh token, verifica firma y vigencia, revisa que no esté revocado, rota el token y entrega un nuevo access token. **No** acepta el refresh como sustituto del access en rutas protegidas.
- [x] `POST /api/auth/logout`: revoca el refresh token.
- [x] `GET /api/auth/me`: devuelve el usuario autenticado.
- [x] Middlewares:
  - `autenticar`: sin token, token inválido o expirado → **401**.
  - `autorizarRoles(...roles)`: autenticado sin permiso → **403**.
  - `autorizarPropietario(fn)`: verifica que el recurso pertenece al usuario (por ejemplo, que la reserva sea de su `id_cliente`); si no → **403**.
- [x] Payload del JWT: `{ sub: id_usuario, rol: "Cliente|Recepcionista|Administrador", id_cliente?, id_empleado? }`.
- [x] Actualizar `backend/.env.example` con todas las variables (sección 6).
- [x] `backend/scripts/seedAdmin.js` + script `npm run seed:admin` en `package.json`: crea el primer administrador leyendo `SEED_ADMIN_*` del `.env`, con contraseña hasheada y sin credenciales reales en el código.
- [x] Montar `/api/auth` en `server.js` (descomentar/crear).
- [x] Entregar a Holman el contrato de `models/usuarioModel.js` que usará el login: `buscarPorCorreo`, `buscarPorId`.

**Terminado cuando:** se puede hacer login por consola/Postman con el usuario seed, el access token funciona en una ruta protegida, sin token da 401 y con rol incorrecto da 403, el refresh renueva y el logout revoca.

**Para cerrar la Parte 1 (Santiago), falta:**
- [x] Aplicar `database/refresh_tokens.sql` en la base local.
- [x] Configurar los secretos JWT en `backend/.env` (`SEED_ADMIN_PASSWORD` sigue pendiente).
- [x] Verificar el seed con un usuario temporal: crea correctamente y es idempotente.
- [x] Probar el flujo completo de forma automatizada: login, `/me`, refresh con rotación y concurrencia, logout, 401 y 403.
- [x] Crear los usuarios de prueba de los tres roles; credenciales en `docs/Credenciales-Prueba.md` y en `backend/.env`.
- [ ] Documentar arquitectura, seed y variables de entorno para el informe.

**Documentación a entregar:** explicación de la arquitectura de autenticación, descripción del seed del primer usuario y variables de entorno del backend.

---

### Parte 2 — Holman: gestión de usuarios + funcionalidad exclusiva del Administrador

**Objetivo:** módulo transversal de usuarios (solo admin) y la funcionalidad de negocio del admin.

**Backend** (`backend/models/usuarioModel.js`, `backend/controllers/usuarioController.js`, `backend/routes/usuarioRoutes.js`)
- [ ] `GET /api/usuarios` (lista sin `password_hash`), `GET /api/usuarios/:id`, `POST /api/usuarios`, `PUT /api/usuarios/:id`, `PATCH /api/usuarios/:id/rol`, `DELETE /api/usuarios/:id`.
- [ ] Validaciones: correo y nombre de usuario únicos, rol existente, contraseña mínima, hash con bcrypt al crear o cambiar contraseña.
- [ ] Todas las rutas con `autenticar` + `autorizarRoles('Administrador')`.
- [ ] Reglas de seguridad: nadie se autoelimina, no se puede dejar el sistema sin administrador, no se puede cambiar el rol propio si eso deja el sistema sin admin.
- [ ] `POST /api/usuarios` debe crear también el registro en `clientes` o `empleados` cuando el rol lo requiera (acordar con Santiago el payload).

**Funcionalidad exclusiva del Administrador**

Las rutas de `habitaciones` y `tipos-habitacion` ya existen del trabajo anterior, así que aquí el trabajo es **protegerlas y completarlas**:
- [ ] Aplicar `autenticar` a todas y `autorizarRoles('Administrador')` solo a `POST`, `PUT` y `DELETE`.
- [ ] `GET /api/habitaciones` y `GET /api/tipos-habitacion` quedan disponibles para cualquier usuario autenticado (solo consulta).
- [ ] Si falta el cambio de disponibilidad, agregarlo con `PUT /api/habitaciones/:id` (campo `estado`), validando valores permitidos.

**Frontend** (`frontend/src/app/usuarios/**`, `frontend/src/components/usuarios/**`)
- [ ] Listado de usuarios con rol y estado; formulario de creación/edición; selector de rol; confirmación al eliminar.
- [ ] Ocultar el módulo y las acciones de escritura para roles distintos de Administrador.
- [ ] En habitaciones/tipos: mostrar botones de crear/editar/eliminar solo al Administrador (el backend igual debe rechazar).
- [ ] Agregar los helpers de usuarios a `frontend/src/lib/api.js` (solo el bloque de usuarios, no tocar el interceptor de Leonardo).

**Terminado cuando:** el admin crea, lista, consulta, edita, cambia de rol y elimina usuarios; un Cliente o Recepcionista recibe 403 al intentar escribir; no se filtra `password_hash`.

**Cuidado:** el cambio de rol es el punto más delicado. Validar en el backend que un admin no se quite a sí mismo el rol si es el último, que nadie pueda ascenderse y que nunca se devuelva `password_hash`. Al eliminar, manejar las FKs de `reservas` y `check_ins` con un 400 claro.

**Documentación a entregar:** tabla de funcionalidades exclusivas completa y tabla de endpoints del informe (método, ruta, propósito, autenticación, roles, propiedad).

---

### Parte 3 — Leonardo: sesión en el frontend + funcionalidad exclusiva del Cliente

**Objetivo:** que la interfaz respete la sesión y el rol, y que el cliente gestione acompañantes solo en sus reservas.

**Frontend de autenticación** (`frontend/src/lib/auth/`, `frontend/src/app/login/`, `frontend/src/app/layout.js`, `frontend/src/components/layout/AppLayout.jsx`, `frontend/middleware.js`)
- [ ] `AuthContext` con: usuario actual, login, logout, `accessToken` en memoria, `refreshToken` en `localStorage`, estado de carga inicial.
- [ ] Modificar `apiFetch` en `lib/api.js` para enviar `Authorization: Bearer <accessToken>` y, ante un 401, intentar `/api/auth/refresh` una sola vez y repetir la petición. Si el refresh falla, cerrar sesión y redirigir al login.
- [ ] Pantalla `/login` con validación, mensaje de error (credenciales inválidas, servidor caído) y estado de carga.
- [ ] Guardas: componente/cliente que redirige a `/login` si no hay sesión y a una pantalla de "acceso denegado" si el rol no está autorizado. Puede apoyarse en `middleware.js` de Next solo como primer filtro.
- [ ] Menú por rol: Cliente (sus reservas), Recepcionista (reservas/check-in), Administrador (usuarios, habitaciones, tipos).
- [ ] Cierre de sesión: llamar a `/api/auth/logout`, borrar tokens y volver al login.
- [ ] Manejo de estados de carga, 401, 403 y éxito en las pantallas nuevas.

**Funcionalidad exclusiva del Cliente** (`backend/routes/reservaHuespedesRoutes.js`, controlador/modelo propios; `frontend/src/app/mis-reservas/**`)
- [ ] `GET /api/reservas/:id/huespedes` — dueño de la reserva, Recepcionista y Administrador.
- [ ] `POST /api/reservas/:id/huespedes` — solo el Cliente dueño de la reserva; inserta en `huespedes` y `reserva_huespedes`.
- [ ] `DELETE /api/reservas/:id/huespedes/:idHuesped` — solo el Cliente dueño.
- [ ] Validaciones: la reserva existe, pertenece al cliente autenticado (`reservas.id_cliente` ↔ `clientes.id_usuario`), documento no duplicado, reserva no cancelada/finalizada.
- [ ] Pantalla "Mis reservas" con detalle de acompañantes: agregar, listar y eliminar.
- [ ] En la misma pantalla, permitir crear/modificar/cancelar **solo reservas propias** (coordinar con Kevin, dueño de `reservaRoutes`).

**Terminado cuando:** un cliente ve solo sus reservas y acompañantes; al intentar tocar la reserva de otro recibe 403 y la interfaz no le muestra la opción; recepcionista/admin solo consultan.

**Cuidado:** el refresh token se rota; implementar **una sola promesa de renovación** compartida para peticiones simultáneas y no reintentar nunca el propio `/refresh`. El access token va en memoria, no en `localStorage`. Las guardas del frontend son solo experiencia de usuario: el backend debe seguir rechazando.

**Documentación a entregar:** descripción de roles y permisos, modalidad de creación de usuarios y guía de instalación del frontend.

---

### Parte 4 — Kevin: funcionalidad exclusiva del Recepcionista + integración

**Objetivo:** check-in/check-out completo y cierre de la entrega (informe, video, ZIP).

**Backend** (`backend/models/checkinModel.js`, `backend/controllers/checkinController.js`, `backend/routes/checkinRoutes.js`; ajustes en `reservaController.js`/`reservaRoutes.js`)
- [ ] `POST /api/reservas/:id/check-in`: solo Recepcionista. Valida que la reserva exista, esté en estado `PENDIENTE`/`CONFIRMADA`, que la fecha de entrada sea la del día (o permitir justificación), registra en `check_ins` con `realizado_por = id_empleado` y actualiza la reserva a `EN_CURSO` y la habitación a `OCUPADA`.
- [ ] `POST /api/reservas/:id/check-out`: solo Recepcionista. Valida que exista check-in previo, registra en `check_outs`, actualiza reserva a `FINALIZADA` y habitación a `DISPONIBLE`.
- [ ] `GET /api/checkins?fecha=YYYY-MM-DD` (opcional) para consultar la jornada: Recepcionista y Administrador.
- [ ] Reglas de reservas por rol: Recepcionista gestiona todas; Cliente solo las propias; Administrador solo consulta. Aplicar `autenticar` y `autorizarRoles` en `reservaRoutes.js`.
- [ ] Validar que un Cliente no pueda hacer check-in/check-out (403).

**Frontend** (`frontend/src/app/reservas/[id]/page.js` y componentes de reservas)
- [ ] Botones "Registrar check-in" y "Registrar check-out" visibles solo para Recepcionista y según el estado de la reserva.
- [ ] Confirmación, manejo de error (reserva ya tiene check-in, estado inválido) y refresco de datos.
- [ ] Pantalla o filtro de check-ins del día.

**Integración de la entrega**
- [ ] Diagrama final de la base de datos.
- [ ] Diagrama de casos de uso "cero".
- [ ] Compilar el informe PDF con los aportes de todos (portada, integrantes y responsabilidades).
- [ ] Guion y edición del video (≤15 min) con clips de cada integrante.
- [ ] Armar el ZIP: `backend/`, `frontend/`, `database/`, informe y enlace/archivo del video; verificar que **no** haya `node_modules`.

**Terminado cuando:** el recepcionista hace check-in y check-out y los estados cambian en BD; el cliente recibe 403; el ZIP abre, instala y corre en una máquina limpia.

**Cuidado:** no permitir check-out sin check-in previo ni check-in duplicado; actualizar reserva y habitación en la misma operación; y no olvidar que `realizado_por` necesita un `id_empleado` real. Las reglas de reservas por rol deben quedar en `reservaRoutes.js`, no solo en la interfaz.

---

## 6. Contrato técnico común (para no chocar)

### 6.1 Variables de entorno

**Backend (`backend/.env.example`)**
```env
PORT=5000
DATABASE_URL=postgres://usuario:contrasena@localhost:5432/hotel_laureles
JWT_ACCESS_SECRET=cambiar
JWT_REFRESH_SECRET=cambiar
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
SEED_ADMIN_NOMBRE=admin
SEED_ADMIN_CORREO=admin@hotel.local
SEED_ADMIN_PASSWORD=cambiar
```

**Frontend (`frontend/.env.local.example`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6.2 Respuestas y códigos

- Login correcto: `{ accessToken, refreshToken, usuario: { id, nombre_usuario, correo, rol } }`.
- Error de validación: **400** `{ mensaje, errores }`.
- Credenciales incorrectas o token ausente/inválido/expirado: **401** `{ mensaje }`.
- Autenticado sin permiso o recurso ajeno: **403** `{ mensaje }`.
- Recurso inexistente: **404**.
- **Nunca** incluir `password_hash` en una respuesta.

### 6.3 Dueño de cada archivo (evitar conflictos de merge)

| Archivo / carpeta | Dueño |
|---|---|
| `backend/server.js` | Santiago (montaje de auth y protección base; los demás piden el cambio) |
| `backend/middlewares/**`, `backend/utils/tokenUtils.js`, `backend/controllers/authController.js`, `backend/models/refreshTokenModel.js`, `backend/scripts/seedAdmin.js` | Santiago |
| `backend/models/usuarioModel.js` | Santiago crea la base en la Parte 1 (`buscarPorCorreo`, `buscarPorId`); después la amplía Holman |
| `backend/controllers/usuarioController.js`, `backend/routes/usuarioRoutes.js` | Holman |
| `backend/controllers/habitacionController.js`, `backend/routes/habitacionRoutes.js`, `backend/controllers/tiposHabitacionController.js`, `backend/routes/tiposHabitacionRoutes.js` | Holman (protección) |
| `backend/**checkin**`, `backend/**checkout**`, `backend/routes/reservaRoutes.js`, `backend/controllers/reservaController.js` | Kevin |
| `backend/controllers/reservaHuespedesController.js`, `backend/models/reservaHuespedesModel.js`, `backend/routes/reservaHuespedesRoutes.js` | Leonardo |
| `database/**` | Santiago (refresh tokens) y Kevin (ajustes de check-in) |
| `frontend/src/lib/api.js` | Leonardo modifica el interceptor; cada dueño agrega solo sus helpers |
| `frontend/src/lib/auth/**`, `frontend/src/app/login/**`, `frontend/middleware.js`, `frontend/src/components/layout/AppLayout.jsx` | Leonardo |
| `frontend/src/app/usuarios/**`, `frontend/src/components/usuarios/**` | Holman |
| `frontend/src/app/mis-reservas/**` | Leonardo |
| `frontend/src/app/reservas/**` (botones check-in/out) | Kevin |
| `docs/**`, informe, video, ZIP | Todos aportan; consolida Kevin |

### 6.4 Contrato de autenticación ya implementado (Parte 1)

**Login** — `POST /api/auth/login`
```json
{ "correo": "admin@hotel.local", "password": "..." }
```
Responde **200**:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "usuario": {
    "id_usuario": 1,
    "id_rol": 3,
    "rol": "Administrador",
    "nombre_usuario": "admin",
    "correo": "admin@hotel.local",
    "estado": "ACTIVO",
    "id_cliente": null,
    "id_empleado": null
  }
}
```

**Rutas protegidas** — enviar `Authorization: Bearer <accessToken>`.

**Refresh** — `POST /api/auth/refresh` con `{ "refreshToken": "..." }`. Devuelve el mismo formato del login y **rota** el refresh anterior.

**Logout** — `POST /api/auth/logout` con access token y, opcionalmente, `{ "refreshToken": "..." }`. Sin refresh token revoca todas las sesiones del usuario.

**Usuario actual** — `GET /api/auth/me` devuelve **directamente** el objeto del usuario (sin envoltorio `{ usuario }`).

Errores: **400** datos inválidos, **401** credenciales o token, **403** cuenta inactiva o sin permiso.

---

## 7. Orden de ejecución (dependencias)

| Fase | Qué se hace | Quién |
|---|---|---|
| **0. Acuerdo** | Cerrar decisiones de la sección 3, crear ramas y acordar el contrato de `usuarioModel` y de `AuthContext` | Todos (1 sesión) |
| **1. Backend base** | `usuarioModel` con búsquedas + auth (login, refresh, middlewares, seed) | Santiago (modelo base y auth); Holman lo amplía |
| **2. Backend por módulos** | Usuarios, check-in/check-out y acompañantes, en paralelo | Holman, Kevin, Leonardo |
| **3. Frontend** | Sesión, guardas y menús primero; después pantallas de cada módulo | Leonardo primero; luego Holman y Kevin |
| **4. Cruzada** | Cada integrante prueba la parte de otro: 401, 403, propiedad, refresh, seed | Todos |
| **5. Entrega** | Informe, video, ZIP y prueba en máquina limpia | Todos; consolida Kevin |

Regla de oro: **nadie avanza al frontend de su módulo hasta que exista el `AuthContext`
y el interceptor de refresh** (Parte 3). Mientras tanto se puede trabajar el backend.

---

## 8. Inventario de endpoints (base para el informe)

Holman completa esta tabla con propósito y restricciones exactas; cada dueño revisa sus filas.

> **Implementado en la Parte 1:** solo `/api/auth/login`, `/refresh`, `/logout` y `/me`.
> El resto está pendiente; la tabla debe coincidir con el código final antes de pasarla al informe.

| Método | Ruta | Autenticación | Roles autorizados | Propiedad / nota |
|---|---|---|---|---|
| POST | `/api/auth/login` | No | Público | Credenciales válidas |
| POST | `/api/auth/refresh` | Refresh token | Público con refresh válido | Solo renueva, no da acceso a recursos |
| POST | `/api/auth/logout` | Sí | Todos | Revoca el refresh del usuario |
| GET | `/api/auth/me` | Sí | Todos | Solo el propio usuario |
| GET | `/api/usuarios` | Sí | Administrador | — |
| GET | `/api/usuarios/:id` | Sí | Administrador | — |
| POST | `/api/usuarios` | Sí | Administrador | Crea usuario y asigna rol |
| PUT | `/api/usuarios/:id` | Sí | Administrador | No devuelve hash |
| PATCH | `/api/usuarios/:id/rol` | Sí | Administrador | No dejar el sistema sin admin |
| DELETE | `/api/usuarios/:id` | Sí | Administrador | No autoeliminarse |
| GET | `/api/habitaciones` | Sí | Todos | Solo consulta para no admin |
| POST/PUT/DELETE | `/api/habitaciones/:id?` | Sí | Administrador | Funcionalidad exclusiva admin |
| GET | `/api/tipos-habitacion` | Sí | Todos | Solo consulta para no admin |
| POST/PUT/DELETE | `/api/tipos-habitacion/:id?` | Sí | Administrador | Funcionalidad exclusiva admin |
| GET | `/api/reservas` | Sí | Todos | Cliente: solo las propias |
| POST | `/api/reservas` | Sí | Cliente, Recepcionista | Cliente crea para sí |
| PUT | `/api/reservas/:id` | Sí | Cliente dueño, Recepcionista | Cliente no edita ajenas |
| DELETE | `/api/reservas/:id` | Sí | Cliente dueño, Recepcionista, Administrador | Cliente no elimina ajenas |
| GET | `/api/reservas/:id/huespedes` | Sí | Cliente dueño, Recepcionista, Administrador | Funcionalidad exclusiva cliente |
| POST | `/api/reservas/:id/huespedes` | Sí | Cliente dueño | Funcionalidad exclusiva cliente |
| DELETE | `/api/reservas/:id/huespedes/:idHuesped` | Sí | Cliente dueño | Funcionalidad exclusiva cliente |
| POST | `/api/reservas/:id/check-in` | Sí | Recepcionista | Funcionalidad exclusiva recepcionista |
| POST | `/api/reservas/:id/check-out` | Sí | Recepcionista | Funcionalidad exclusiva recepcionista |
| GET | `/api/checkins?fecha=` | Sí | Recepcionista, Administrador | Consulta de la jornada |

---

## 9. Entregables y responsables

| Entregable | Contenido | Responsable |
|---|---|---|
| Código backend/frontend | Sin `node_modules`, con `.env.example` en ambos | Todos |
| Datos de prueba por rol | Admin, recepcionista (con fila en `empleados`) y cliente (con fila en `clientes`); credenciales en `docs/Credenciales-Prueba.md`. Faltan reservas y habitaciones de ejemplo | Todos; coordina Kevin |
| Scripts BD | Esquema actualizado + `refresh_tokens` + datos de prueba | Santiago y Kevin |
| Seed primer usuario | `npm run seed:admin` documentado | Santiago |
| Informe PDF | Portada, integrantes y responsabilidades, roles/permisos, modalidad, tabla de funcionalidades, endpoints, diagrama BD, casos de uso "cero", arquitectura, primer usuario, guía de instalación | Aportes de todos; compila Kevin |
| Video ≤ 15 min | Login por cada rol, menús, usuarios, las tres funcionalidades exclusivas, restricciones 401/403 | Graba cada uno; edita Kevin |
| ZIP único en Teams | Código + scripts + informe + video | Kevin |

---

## 10. Checklist final de autoevaluación (contra el PDF)

- [ ] Login genera access token y refresh token; el refresh **solo** renueva.
- [ ] Contraseñas con bcrypt; ningún hash ni contraseña en respuestas.
- [ ] Middlewares de autenticación, rol y propiedad en el backend.
- [ ] 401 para no autenticado y 403 para sin permiso (probado en Postman).
- [ ] Secretos, expiraciones y conexión en variables de entorno.
- [ ] CRUD de usuarios completo y restringido a Administrador.
- [ ] Seed del primer administrador documentado y ejecutable.
- [x] Hay un usuario de prueba por cada rol, con su fila en `clientes`/`empleados` cuando corresponde (credenciales en `docs/Credenciales-Prueba.md`).
- [ ] Exactamente una funcionalidad exclusiva por rol, con BD, API, validaciones e interfaz.
- [ ] La gestión de usuarios no se presenta como funcionalidad exclusiva del admin.
- [ ] Frontend: login, guardas, menús por rol, renovación de token, logout, estados de carga/error.
- [ ] El frontend renueva el token una sola vez (sin doble refresh por peticiones simultáneas).
- [ ] Ocultar botones no es la única defensa: el backend rechaza igual.
- [ ] Diagramas de BD final y casos de uso "cero" incluidos.
- [ ] Guía de instalación reproducible en una máquina limpia.
- [ ] Video ≤ 15 min con todo lo exigido.
- [ ] ZIP sin `node_modules`, subido a Teams (no solo un enlace).

---

## 11. Reglas de trabajo en Git

1. Una rama por parte; PR pequeño y revisado por otro integrante antes de integrar.
2. No editar archivos de otro dueño sin avisar (tabla 6.3).
3. Commits en español, en imperativo y con alcance: `auth: agregar refresh token`.
4. Antes de cada PR: backend levanta, frontend compila y las rutas tocadas responden.
5. Los `.env` reales no se suben; solo los `.example`.
6. Probar la entrega final en una copia limpia del ZIP antes de subirla.
