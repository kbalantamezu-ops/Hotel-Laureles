# PLANTILLA — Cómo crear un nuevo CRUD en este backend

> **IMPORTANTE:** Lee este archivo completo **antes** de escribir cualquier código.
> Sirve tanto para el equipo como para una IA/agente que vaya a implementar el CRUD.
> Si eres una IA: sigue los pasos de la sección final **en orden**, sin saltarte ninguno.

---

## 1. Contexto del proyecto

- **Proyecto:** Hotel Los Laureles — sistema de gestión (Tarea 2: API REST con CRUD).
- **Stack obligatorio:** Node.js + Express + PostgreSQL, respuestas en **JSON**, **sin autenticación (JWT)** en esta tarea.
- **Base de datos:** **Neon (nube)**. La conexión ya está resuelta y **NO se debe tocar**:
  - `backend/.env` → variable `DATABASE_URL` (credenciales; nunca las copies al código ni al Git).
  - `backend/config/db.js` → pool de conexiones con SSL. Si no lo necesitas, **no lo modifiques**.
- **Esquema SQL:** `database/Script Hotel laureles.sql` → ahí están TODAS las tablas con sus
  columnas, `NOT NULL`, `UNIQUE`, `CHECK` y claves foráneas. **Es la fuente de verdad.**

## 2. Implementación de referencia (ya probada y funcionando)

Estos 3 archivos son la **plantilla viva**. Cópialos y adáptalos:

| Capa | Archivo de referencia | Qué copiar |
|---|---|---|
| Modelo | `backend/models/tiposHabitacionModel.js` | Las 5 funciones SQL parametrizadas |
| Controlador | `backend/controllers/tiposHabitacionController.js` | Validaciones + códigos HTTP + errores de BD |
| Rutas | `backend/routes/tiposHabitacionRoutes.js` | El `Router()` con los 5 verbos |

**Nunca** rompas lo que ya funciona: después de cada cambio verifica que
`GET /api/tipos-habitacion` sigue respondiendo `200`.

## 3. CRUDs pendientes

| Ruta en `server.js` | Tabla | Archivos a crear | Estado |
|---|---|---|---|
| `/api/auth` | `usuarios` | `routes/authRoutes.js` + `controllers/authController.js` + `models/usuarioModel.js` | import comentado |
| `/api/habitaciones` | `habitaciones` | `routes/habitacionRoutes.js` + controlador + modelo | import comentado |
| `/api/reservas` | `reservas` | `routes/reservaRoutes.js` + controlador + modelo | import comentado |

En `server.js` ya están escritas (pero **comentadas**) las líneas que hay que
descomentar al crear cada archivo:

```js
// import authRoutes from './routes/authRoutes.js';
// app.use('/api/auth', authRoutes);
```

## 4. Pasos para implementar UN CRUD (repetir por cada tabla)

### Paso 1 — Estudia la tabla en el script SQL
Ubica la tabla en `database/Script Hotel laureles.sql` y anota:
- columnas y sus tipos,
- cuáles son `NOT NULL` (→ obligatorias en el POST),
- restricciones `CHECK` (→ reglas de validación: ej. `capacidad > 0`),
- `UNIQUE` (→ puede fallar con código de BD `23505`),
- claves foráneas `REFERENCES` (→ el `DELETE` puede fallar con `23503`).

### Paso 2 — Crea el MODELO en `backend/models/`
Copia `tiposHabitacionModel.js` y renombra:
- las 5 funciones: `obtenerTodos`, `obtenerPorId`, `crear`, `actualizar`, `eliminar`,
- el nombre de la tabla y sus columnas en cada consulta,
- la lista `CAMPOS_PERMITIDOS` (solo esos campos se pueden actualizar).

**Reglas del modelo:**
- Consultas **siempre parametrizadas** (`$1, $2...`). Prohibido concatenar valores (inyección SQL).
- El modelo **no** valida datos ni devuelve respuestas HTTP: solo habla con la BD.
- No incluyas la columna ID en el `INSERT` (son `GENERATED ALWAYS AS IDENTITY`: la BD la genera).

### Paso 3 — Crea el CONTROLADOR en `backend/controllers/`
Copia `tiposHabitacionController.js` y adapta las validaciones a los `CHECK` del Paso 1.

**Códigos HTTP obligatorios:**

| Código | Cuándo |
|---|---|
| `200` | GET/PUT/DELETE exitosos |
| `201` | POST que crea el recurso |
| `400` | datos faltantes/inválidos, ID no numérico, nombre duplicado (`err.code === '23505'`), FK violada en DELETE (`err.code === '23503'`) |
| `404` | el ID no existe |
| `500` | cualquier fallo de la base de datos (bloque `catch` centralizado) |

**Reglas del controlador:**
- Respuestas **siempre en JSON** con mensajes en español (`{ mensaje, ... }`).
- Nunca devuelvas el error crudo de la BD al cliente ni hagas `swallow` de errores.
- Sin JWT ni middlewares de autenticación en esta tarea.

### Paso 4 — Crea las RUTAS en `backend/routes/`
Copia `tiposHabitacionRoutes.js`, renombra el import del controlador y documenta
los 5 verbos con su comentario.

### Paso 5 — Conecta en `backend/server.js`
1. Descomenta (o agrega) el `import` de tu archivo de rutas.
2. Descomentar (o agrega) su `app.use('/api/tu-recurso', ...)`.

> Nota: el archivo usa fin de línea **CRLF**; edítalo con cuidado o reescríbelo completo.

### Paso 6 — Prueba (obligatorio antes de entregar)

```bash
node --check server.js && node --check models/tuModelo.js   # sintaxis
node backend/server.js                                      # arrancar

# Checklist mínimo (deben responder los 5 códigos):
curl -s -w " [%{http_code}]" http://localhost:5000/api/tu-recurso                                  # 200
curl -s -w " [%{http_code}]" -X POST -H "Content-Type: application/json" -d '{}' http://localhost:5000/api/tu-recurso   # 400
curl -s -w " [%{http_code}]" -X POST -H "Content-Type: application/json" -d '{...datos validos...}' http://localhost:5000/api/tu-recurso  # 201
curl -s -w " [%{http_code}]" http://localhost:5000/api/tu-recurso/9999                              # 404
curl -s -w " [%{http_code}]" http://localhost:5000/api/tu-recurso/abc                               # 400
curl -s -w " [%{http_code}]" -X DELETE http://localhost:5000/api/tu-recurso/1                       # 200 o 404
```

Deja al final **algunos registros de ejemplo** en la tabla (como en `tipos_habitacion`).
Detén el servidor al terminar (que quede el puerto 5000 libre).

## 5. Datos rápidos de las tablas pendientes

### `usuarios` (para `/api/auth`)
`id_usuario` (PK, auto) · `id_rol` (FK→roles, NOT NULL) · `nombre_usuario` (NOT NULL, UNIQUE) ·
`correo` (NOT NULL, UNIQUE) · `password_hash` (NOT NULL) · `estado` (default `'ACTIVO'`) ·
`fecha_creacion` (default `CURRENT_TIMESTAMP`, no se envía).

### `habitaciones`
`id_habitacion` (PK, auto) · `id_tipo_habitacion` (FK→tipos_habitacion, NOT NULL) ·
`numero` (NOT NULL, UNIQUE) · `piso` (NOT NULL, CHECK `>= 0`) ·
`estado` (default `'DISPONIBLE'`) · `descripcion`.

> Ojo: el `DELETE` de `tipos_habitacion` ya está protegido contra `23503` porque
> `habitaciones` tiene `ON DELETE RESTRICT`. Igual patrón para el resto.

### `reservas`
`id_reserva` (PK, auto) · `id_cliente` (FK, NOT NULL) · `id_habitacion` (FK, NOT NULL) ·
`fecha_reserva` (default `CURRENT_TIMESTAMP`) · `fecha_entrada`/`fecha_salida` (NOT NULL,
CHECK `fecha_salida > fecha_entrada`) · `cantidad_huespedes` (NOT NULL, CHECK `> 0`) ·
`estado` (default `'PENDIENTE'`) · `observaciones` · `total` (NOT NULL, CHECK `>= 0`).

---

## 6. Instrucciones para una IA / agente

Si estás leyendo esto como agente de código, haz **exactamente** esto:

1. **Lee** `database/Script Hotel laureles.sql` y localiza la tabla que te pidan.
2. **Copia** la estructura de los 3 archivos de referencia
   (`models/tiposHabitacionModel.js`, `controllers/tiposHabitacionController.js`,
   `routes/tiposHabitacionRoutes.js`), renombrando tabla, columnas y mensajes.
3. **Valida** cada campo según los `NOT NULL`/`CHECK`/`UNIQUE` de esa tabla,
   devolviendo `400` con lista de errores en español.
4. **Descomenta/agrega** el `import` y el `app.use(...)` correspondiente en `server.js`.
5. **Verifica**: `node --check` de los archivos tocados, arranca el servidor y ejecuta el
   checklist del Paso 6 comprobando los códigos 200/201/400/404 (y 500 si puedes simularlo).
6. **No** toques `.env`, `config/db.js` ni los CRUD ya existentes; no agregues JWT;
   comentarios en **español**; sin marcas de autoría ni firmas de IA en el código.
7. Al terminar: carpeta limpia (sin logs ni scripts de prueba), puerto 5000 libre,
   registros de ejemplo en la tabla y reporte con las pruebas realizadas.

---

*Plantilla creada tras implementar y verificar el CRUD de `tipos_habitacion` (Tarea 2),
que funciona como ejemplo de referencia para el resto de tablas.*
