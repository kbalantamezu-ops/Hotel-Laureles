# Backend

API REST del sistema **Hotel Los Laureles** construida con:

- **Express.js** (Node.js, ESM)
- **PostgreSQL** mediante `pg`

## Endpoints base de la API

| Recurso | Ruta base |
|---|---|
| Health | `GET /api/health` |
| Tipos de habitación | `GET/POST /api/tipos-habitacion`, `GET/PUT/DELETE /api/tipos-habitacion/:id` |
| Habitaciones | `GET/POST /api/habitaciones`, `GET/PUT/DELETE /api/habitaciones/:id` |
| Reservas | `GET/POST /api/reservas`, `GET/PUT/DELETE /api/reservas/:id` |
| Clientes | `GET/POST /api/clientes`, `GET/PUT/DELETE /api/clientes/:id` |

Los endpoints son públicos (no hay autenticación por ahora).

## Iniciar

```bash
cd backend
npm install
npm run dev
```

El servidor arranca en `http://localhost:5000` por defecto (configurable con `PORT`).

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

Variables usadas:

| Variable | Valor por defecto | Utilidad |
|---|---|---|
| `PORT` | `5000` | Puerto del servidor Express |
| `DATABASE_URL` | `postgres://localhost:5432/hotel_laureles` | Cadena de conexión de PostgreSQL |
| `DATABASE_SSL` | no definido | Activa SSL si se pone `true` |
| `JWT_SECRET` | (generado en runtime si no se pone) | Señal para tokens JWT |
| `JWT_EXPIRES_IN` | `7d` | Tiempo de expiración de los tokens |

## Detección de errores comunes

- Si la BD no está lista, el servidor arranca pero las consultas fallarán con errores de conexión.
- Si el frontend no puede conectar, revisa `NEXT_PUBLIC_API_URL` en `frontend/.env.local` y CORS en el backend.
- Los errores de clave foránea (23503) indican que se está creando o actualizando un registro con un id de cliente/habitación/tipo que no existe.
- Los errores de unicidad (23505) indican duplicado en campos únicos definidos en la BD.
