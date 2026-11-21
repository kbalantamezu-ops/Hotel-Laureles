# Credenciales de prueba (solo desarrollo)

> ⚠️ Estas cuentas son para probar la Tarea 4 en la base de desarrollo del proyecto.
> No usarlas en producción ni reutilizar estas contraseñas. Tampoco deben incluirse
> en `.env.example` ni en el ZIP de entrega como credenciales reales.

| Rol | Usuario (correo) | Contraseña | Datos asociados |
|---|---|---|---|
| Administrador | `admin@hotel.local` | `Admin.Laureles2026` | Sin fila en `clientes` ni `empleados` |
| Recepcionista | `recepcion@hotel.local` | `Recepcion.Laureles2026` | Fila en `empleados` (documento `EMP-TEST-001`) |
| Cliente | `cliente@hotel.local` | `Cliente.Laureles2026` | Fila en `clientes` (documento `CC-TEST-001`) |

El login se hace con el **correo**, no con el nombre de usuario:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@hotel.local","password":"Admin.Laureles2026"}'
```

La respuesta trae `accessToken`, `refreshToken` y `usuario`. Para consultar el usuario:

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

## Notas

- Las mismas credenciales están en `backend/.env` (`TEST_*` y `SEED_ADMIN_*`), archivo
  que está fuera del repositorio.
- El cliente y el recepcionista tienen su fila en `clientes`/`empleados` para poder
  probar propiedad de recursos y check-in/check-out más adelante.
- Si se cambia una contraseña en la base, actualizar también `backend/.env` y este archivo.
- Al recrear la base de datos hay que volver a crear estas cuentas (coordinar con Santiago).
