# Hotel-Laureles

Sistema de gestión de un hotel. El proyecto está formado por dos partes bien
separadas que se comunican por una API REST:

- **backend/** — API REST construida con **Express + Node.js** y base de datos
  **PostgreSQL** (`pg`).
- **frontend/** — Interfaz de usuario construida con **Next.js (App Router) +
  Tailwind CSS**.

---

## 1. ¿Qué es el proyecto?

Es una aplicación web para gestionar un hotel. Por ahora el backend expone una
API REST (endpoints de autenticación, habitaciones y reservas) y el frontend es
una interfaz que consumirá ese API.

La arquitectura es **separada**, por lo que puedes desarrollar o desplegar cada
parte independientemente:

```
Hotel-Laureles
├── backend/                # API Express (PostgreSQL via pg)
├── frontend/               # Frontend en Next.js + Tailwind CSS
├── database/               # Snippets/scripts de base de datos
└── docs/                   # Mockups y documentación
```

---

## 2. Estructura del proyecto

### `backend/`

```
backend/
├── config/
│   └── db.js               # Pool de PostgreSQL desde DATABASE_URL
├── server.js               # Entrada de Express: middleware, rutas, health
├── routes/                 # Rutas (vacías por ahora)
├── controllers/            # Controladores (vacíos por ahora)
├── scripts/                # Scripts (vacío por ahora)
├── verificaciones/         # Validaciones (vacío por ahora)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
└── package.json
```

**Responsabilidad:** exponer una API REST y gestionar la base de datos.

### `frontend/`

```
frontend/
├── src/
│   └── app/                # App Router de Next.js
│       ├── layout.js       # Layout raíz + metadata
│       ├── globals.css     # Estilos globales (Tailwind v4)
│       └── page.js         # Página principal
├── public/                 # Recursos estáticos
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── next.config.mjs
├── package.json
└── README.md
```

**Responsabilidad:** consumir la API y mostrar la interfaz al usuario.

### `database/` y `docs/`

- `database/`: snippets, dumps o scripts de creación de tablas.
- `docs/`: documentación del proyecto, mockups y especificaciones (por ejemplo,
  simulacros de la interfaz en `docs/Mockups/Clientes/`).

---

## 3. Configuración del proyecto

### 3.1 Prerrequisitos

- [Node.js](https://nodejs.org/) ≥ 18 (se recomienda la versión LTS).
- PostgreSQL 14+ (local, con un proveedor en la nube o un contenedor).
- Un editor de código (VS Code, WebStorm, etc.).

### 3.2 Variables de entorno

La aplicación lee las variables de entorno con `dotenv`. La forma recomendada de
trabajar es:

1. Copiar el `.env.example` a `.env` en cada carpeta.
2. Rellenar los valores reales.
3. **Nunca commitear** los ficheros `.env` (están excluidos por `backend/.gitignore`
   y `frontend/.gitignore`).

### 3.3 Backend (`backend/`)

```bash
cd backend
cp .env.example .env
# Editar .env con los valores reales:
#   PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
npm install
npm run dev          # http://localhost:5000
```

#### Variables del backend

| Variable | Por defecto | Utilidad |
|---|---|---|
| `PORT` | `5000` | Puerto en el que escucha Express |
| `DATABASE_URL` | `postgres://localhost:5432/hotel_laureles` | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | (generada aleatoriamente en arranque si no se pone) | Secreto para firmar JWT |
| `JWT_EXPIRES_IN` | `7d` | Vencimiento de los JWT |
| `DATABASE_CONNECTION_TIMEOUT` | `2000` (opcional) | Timeout de conexión en ms |
| `DATABASE_MAX_CONNECTIONS` | `20` (opcional) | Máximo de conexiones del pool |

**Ejemplo de `DATABASE_URL`:**

- PostgreSQL local:

  ```bash
  DATABASE_URL=postgres://usuario:contrasena@localhost:5432/hotel_laureles
  ```

- Neon / Railway / Render / DigitalOcean:

  ```bash
  DATABASE_URL=postgres://usuario:contrasena@host:5432/BaseDeDatos
  ```

### 3.4 Frontend (`frontend/`)

```bash
cd frontend
cp .env.example .env.local
# Editar .env.local con los valores reales:
#   NEXT_PUBLIC_API_URL, PORT
npm install
npm run dev          # http://localhost:3000
npm run build        # construcción para producción
npm start            # servidor de producción
```

#### Variables del frontend

| Variable | Valor por defecto | Utilidad |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | URL base de la API del backend |
| `PORT` | `3000` | Puerto del frontend en desarrollo |

> En Next.js, las variables que el **navegador** (cliente) pueda leer deben
> empezar por `NEXT_PUBLIC_`. Las variables normales se leen solo del servidor.

**Ejemplo:**

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=3000
```

---

## 4. Base de datos

El backend usa `pg` (PostgreSQL). La conexión se crea en
`backend/config/db.js` mediante `DATABASE_URL`. El pool se crea, comprueba la
conexión en arranque y se cierra correctamente cuando se detiene el proceso.

### 4.1 Crear la base de datos

```bash
# Ejemplo con psql
psql -h localhost -U usuario -d postgres -c "CREATE DATABASE hotel_laureles;"
```

### 4.2 Migraciones

Esta parte no está implementada aún. La idea es:

1. Crear las tablas necesarias en `database/` (por ejemplo, `habitaciones`,
   `reservas`, `clientes`, `usuarios`).
2. Ejecutar esas migraciones en el entorno de desarrollo.
3. Mantener un script de actualización para producción.

### 4.3 Comprobar la conexión

```bash
cd backend
npm run dev
```

Si `DATABASE_URL` no está definida, se usa la conexión por defecto
`postgres://localhost:5432/hotel_laureles` y se muestra una advertencia en
consola. En producción se recomienda que el proceso falle si no puede conectar.

---

## 5. Ejecución del proyecto

### 5.1 Desarrollo

Los dos procesos se ejecutan en paralelo:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Estado del backend: `http://localhost:5000/api/health`

### 5.2 Producción

```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm run build
npm start
```

### 5.3 Scripts disponibles

#### Backend

| Script | Descripción |
|---|---|
| `npm run dev` | Arranca el servidor con `nodemon` (reinicia al cambiar archivos) |
| `npm start` | Arranca el servidor en producción |

#### Frontend

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Next.js |
| `npm run build` | Compila la aplicación para producción en `.next` |
| `npm start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

---

## 6. Guía para entender el proyecto

### Flujo típico de una petición

```mermaid
sequenceDiagram
    participant Usuario
    participant Browser as Navegador
    participant Frontend as Next.js
    participant Backend as Express
    participant DB as PostgreSQL

    Usuario->>Browser: Interactúa con la interfaz
    Browser->>Frontend: Petición HTTP (fetch)
    Frontend->>Backend: Petición API (fetch /api/*)
    Backend->>DB: Consulta/s inserción
    DB-->>Backend: Respuesta
    Backend-->>Frontend: JSON
    Frontend-->>Browser: HTML/JS/CSS
    Browser-->>Usuario: Interfaz actualizada
```

### Flujo de autenticación (por implementar)

1. Usuario envía correo + contraseña a `/api/auth/login`.
2. El backend verifica las credenciales en `usuarios`.
3. Si son correctas, genera un token JWT firmado con `JWT_SECRET`.
4. El frontend guarda el token y lo incluye en las peticiones futuras.
5. El backend valida el token y concede/accede al recurso solicitado.

### Flujo de reserva (por implementar)

1. Usuario selecciona fecha y habitación desde el frontend.
2. El frontend hace `POST /api/reservas`.
3. El backend valida los datos y crea la reserva.
4. Se inserta una fila en `reservas` y se actualiza el estado de la habitación.
5. El frontend muestra la reserva confirmada o un error.

### Flujo de gestión de habitaciones (por implementar)

1. Operador consulta `/api/habitaciones`.
2. CRUD completo: listar, crear, actualizar y eliminar habitaciones.
3. Cada habitación tiene estado (`disponible`, `ocupada`, `mantenimiento`, etc.).
4. Las reservas se relacionan con las habitaciones.

---

## 7. Endpoints de la API

### Estado del servidor

```
GET /api/health
```

Respuesta:

```json
{
  "status": "OK",
  "message": "Servidor Express de Hotel Los Laureles corriendo correctamente"
}
```

### Rutas disponibles (por implementar)

| Módulo | Endpoint | Acción |
|---|---|---|
| Autenticación | `/api/auth/register` | Crear usuario |
| Autenticación | `/api/auth/login` | Iniciar sesión y obtener JWT |
| Autenticación | `/api/auth/refresh` | Renovar token |
| Habitaciones | `/api/habitaciones` | Listar/crear/actualizar/eliminar habitaciones |
| Reservas | `/api/reservas` | Listar/crear/actualizar/eliminar reservas |

---

## 8. Contribución

1. Crea una rama para tu funcionalidad:

   ```bash
   git checkout -b feat/<nombre>
   ```

2. Haz commit con un mensaje claro y breve:

   ```bash
   git commit -m "feat(backend): agregar endpoint de login"
   ```

3. Abre un Pull Request.

**Convenciones sugeridas para mensajes:**

- `feat(backend): ...` — Nueva funcionalidad en el backend.
- `feat(frontend): ...` — Nueva funcionalidad en el frontend.
- `fix(backend): ...` — Corrección de error.
- `refactor(backend): ...` — Cambio interno sin añadir funcionalidad.
- `docs: ...` — Cambios en documentación.
- `chore: ...` — Cambios de configuración o herramientas.

---

## 9. Despliegue

### Backend

Puedes desplegar el backend en:

- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- AWS / GCP / Azure

Importante:

1. Crear la base de datos en el proveedor.
2. Copiar `DATABASE_URL` y `JWT_SECRET` a las variables de entorno.
3. Exponer el puerto configurado por el proveedor (normalmente `PORT`).

### Frontend

Puedes desplegar el frontend en:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Importante:

1. Exportar `NEXT_PUBLIC_API_URL` con la URL del backend.
2. Construir con `npm run build`.
3. Usar el servidor de producción de Next.js o un CDN que sirva `dist/`.

---

## 10. Tareas pendientes

- Implementar los controladores de autenticación, habitaciones y reservas.
- Crear las migraciones de PostgreSQL.
- Implementar la validación de datos de entrada.
- Implementar los endpoints de autenticación y reservas.
- Vincular el frontend con la API real.
- Añadir tests unitarios e integración.
