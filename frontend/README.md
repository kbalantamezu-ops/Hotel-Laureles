# Frontend

Frontend del sistema **Hotel Los Laureles** construido con:

- **Next.js** (App Router, React 19)
- **Tailwind CSS v4**
- JavaScript (sin TypeScript)
- Sin framework externo: sirve la API y los recursos estáticos con Node.js

## Iniciar

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo se ejecuta en:

```
http://localhost:3000
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Next.js |
| `npm run build` | Compila la app para producción en `.next` |
| `npm start` | Arranca el servidor de producción |
| `npm run lint` | Lanza ESLint sobre el proyecto |

## Estructura del proyecto

```
frontend/
├── public/                 # Recursos estáticos (favicon, imágenes)
├── src/
│   ├── app/                # Rutas con App Router de Next.js
│   │   ├── layout.js       # Layout raíz + metadata
│   │   ├── globals.css     # Estilos globales + Tailwind
│   │   └── page.js         # Página principal (dashboard)
│   ├── components/
│   │   ├── ui/             # Componentes base reutilizables (Button, Modal, Alert, Table, ...)
│   │   └── ...             # Componentes específicos por recurso
│   └── lib/                # Utilidades y ayuda de comunicación con la API
├── next.config.mjs
├── package.json
├── .env.example            # Plantilla de variables de entorno (única)
└── README.md
```

## Variables de entorno

Las variables de entorno se configuran en un fichero `.env.local` (desarrollo)
o `.env.production` (producción). Solo se publica `.env.example` como plantilla.

> **Regla de Next.js:** las variables que el navegador necesita leer deben
> empezar por `NEXT_PUBLIC_`. El resto se leen solo del lado servidor.

### Ejemplo: `frontend/.env.local`

```bash
# URL base de la API del backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Puerto del frontend en desarrollo
PORT=3000
```

El frontend consume la API a través del helper centralizado en
`src/lib/api.js`, que ya agrega la `NEXT_PUBLIC_API_URL` automáticamente.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Next.js |
| `npm run build` | Compila la app para producción |
| `npm start` | Arranca el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## Iniciar el proyecto

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo se ejecuta en:

```
http://localhost:3000
```

Para que funcione correctamente, el backend debe estar levantado y
`NEXT_PUBLIC_API_URL` debe apuntar a él.

## Contribución

- Las vistas viven en `src/app/`.
- Los componentes reutilizables viven en `src/components/ui/`.
- Los componentes específicos por recurso viven en `src/components/<recurso>/`.
- El CSS global se define en `src/app/globals.css` e importa Tailwind.
- Usa las utilidades de Tailwind (`flex`, `grid`, `rounded`, `shadow`, etc.)
  antes que añadir estilos CSS propios.
- Para nuevas secciones de mantenimiento, sigue la guía en
  `GUIA-EQUIPO.md` (o el archivo de guía acordado del equipo).

## Estado del proyecto

En desarrollo. El backend ya tiene el CRUD de las 4 tablas; el frontend está
construyendo el panel de gestión con dashboard y mantenimientos.

## Despliegue

Next.js se puede desplegar en Vercel, Netlify, Railway, Render, o cualquier
servidor que soporte Node.js. Para producción:

```bash
cd frontend
npm run build
npm start
```

El fichero `.gitignore` excluye `node_modules/`, `.next/`, `*.log` y las
variables de entorno.
