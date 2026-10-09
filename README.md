# Hotel-Laureles

Proyecto de sistema de gestión de un hotel. Arquitectura:

- **backend/**: API REST de Express (Node.js) + PostgreSQL.
- **frontend/**: Interfaz de usuario en Next.js + Tailwind CSS.

## Estructura del proyecto

```
.
├── backend/                  # API Express (PostgreSQL via `pg`)
│   ├── config/
│   │   └── db.js             # Pool de PostgreSQL desde DATABASE_URL
│   ├── server.js             # Entrada de Express (rutas /api, health)
│   ├── routes/               # Rutas (vacías por ahora)
│   ├── controllers/          # Controladores (vacíos por ahora)
│   ├── scripts/              # Scripts (vacío por ahora)
│   ├── verificaciones/       # Validaciones (vacío por ahora)
│   ├── package.json
│   └── .env.example          # Plantilla de variables de entorno
├── frontend/                 # Frontend en Next.js + Tailwind CSS
│   ├── src/app/              # App Router de Next.js
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.*     # dependiente de `npx tailwindcss init -p`
│   ├── postcss.config.*      # dependiente de `npx tailwindcss init -p`
│   └── README.md
├── database/                 # Snippets/script de base de datos
├── docs/                     # Mockups y documentación
└── .gitignore                # Reglas globales de Git
```

## Configuración rápida

### Backend

```bash
cd backend
cp .env.example .env          # rellena DATABASE_URL, JWT_SECRET, etc.
npm install
npm run dev                   # http://localhost:5000
```

- Expone la API en `http://localhost:5000/api`.
- La conexión PostgreSQL se lee desde `DATABASE_URL`. Funciona con:
  - PostgreSQL local: `postgres://usuario:contrasena@localhost:5432/hotel_laureles`
  - Proveedores en la nube (Neon, Railway, Render, DigitalOcean, etc.): se pega
    la URL de conexión tal cual.
- `backend/config/db.js` crea un `pg.Pool` y comprueba la conexión en arranque.
- Las variables se cargan con `dotenv`. Los ficheros `.env` están excluidos de Git.

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
npm run build                 # construcción de producción en .next
npm start                     # servidor de producción (producción)
```

- Entorno: **Next.js (App Router)** + **Tailwind CSS v4**.
- La página principal incluye un enlace a la API de forma predeterminada.
- Se puede conectar con el backend en `http://localhost:5000/api` mediante
  `fetch()` desde el navegador (la misma origen en el caso del desarrollo).

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Valor por defecto | Utilidad |
|---|---|---|
| `PORT` | `5000` | Puerto en el que escucha Express |
| `DATABASE_URL` | `postgres://localhost:5432/hotel_laureles` | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | (clave aleatoria generada en tiempo de ejecución si no se pone) | Firma de los tokens JWT |
| `JWT_EXPIRES_IN` | `7d` | Vencimiento de los tokens |

### Frontend (`frontend/.env`)

En Next.js se pueden añadir variables de entorno en `.env.local` (o `.env.development`).
Las variables de entorno de la API no se exponen en el cliente salvo que empiecen
por `NEXT_PUBLIC_`. Ejemplo:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

También puedes crear un fichero `.env.example` en `frontend/` para documentarlas.

## Base de datos

El backend usa `pg` (PostgreSQL). La conexión se realiza desde
`backend/config/db.js` mediante la variable `DATABASE_URL`, por lo que funciona
con:

- PostgreSQL local: `postgres://usuario:contrasena@localhost:5432/hotel_laureles`
- Servidores en la nube (Neon, Railway, Render, DigitalOcean, etc.): el mismo
  formato, solo hay que copiar la URL de conexión.

Si `DATABASE_URL` no está definida, se usa la conexión por defecto
`postgres://localhost:5432/hotel_laureles` y se muestra una advertencia en consola.

## Git

Los ficheros excluidos son:

- Dependencias (`node_modules/`), lockfiles de otros entornos y los ficheros de
  configuración de revisión.
- Secrets y variables sensibles (`.env`, `.env.local`, `*.key`, `*.pem`).
- Artefactos de build y compresión/temporales (`.next`, `dist/`, `*.log`, `tmp/...`).
- Ficheros generados por editores, entornos de desarrollo y caché.