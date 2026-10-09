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
├── public/
├── src/
│   └── app/
│       ├── layout.js       # Layout raíz + metadata
│       ├── globals.css     # Fuente de estilos + Tailwind
│       └── page.js         # Página principal
├── next.config.mjs
├── package.json
├── tailwind.config.mjs     # generado por `npx tailwindcss init -p`
├── postcss.config.mjs      # generado por `npx tailwindcss init -p`
├── .env.example            # Plantilla de variables de entorno
└── README.md
```

## Variables de entorno

Las variables de entorno respectivas se pueden añadir a un fichero `.env.local`
(para el entorno de desarrollo) o `.env.production` (para producción).

> **Regla de Next.js:** las variables que el cliente (navegador) necesita leer
> deben empezar por `NEXT_PUBLIC_`. Las variables normales (`API_URL`, etc.) se
> leen solo del servidor.

### Ejemplo: `frontend/.env.local`

```bash
# URL base de la API del backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Puerto del frontend en desarrollo
PORT=3000
```

### .env.example

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
PORT=3000
```

## Conectar con el backend

El frontend puede consumir la API de manera directa desde el navegador:

```js
const res = await fetch("http://localhost:5000/api/health");
const data = await res.json();
console.log(data.status, data.message);
```

El backend expone la API en `/api/...` y las rutas `GET /api/health` para
comprobar que está funcionando.

## Contribución

- Mantén las carpetas `src/app` para las vistas.
- El CSS global se define en `src/app/globals.css` e importa Tailwind.
- Usa las utilidades de Tailwind (clases `flex`, `grid`, `rounded`, `shadow`,
  etc.) en vez de añadir estilos CSS propios siempre que sea posible.

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
