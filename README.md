#  Hotel Los Laureles

> Aplicación web para la gestión integral de reservas, huéspedes, habitaciones, pagos y servicios del hotel.

**Proyecto Final – Programación V (S641A)**
Facultad de Ingeniería · Programa de Ingeniería de Sistemas
Institución Universitaria Antonio José Camacho
Docente: Ing. Nilson Mossos · Septiembre de 2026

---

##  Integrantes

- Kevin Andres Balanta
- Holman David Arrahondo
- Leonardo Angel
- Santiago Niño

---

##  Descripción

Hotel Los Laureles es una aplicación web que permite gestionar de manera integral las reservas, huéspedes, habitaciones, pagos y servicios del hotel. Los clientes pueden organizar su estadía con anticipación y el personal puede administrar la operación del hotel de forma eficiente.

##  Problema a resolver

La alta demanda del hotel y la dificultad para gestionar de forma organizada los ingresos y las reservas.

##  Propósito

Mejorar la calidad del servicio del hotel mediante una aplicación web que facilite la gestión de reservas, habitaciones, huéspedes, pagos y servicios adicionales, tanto para los clientes como para el personal.

##  Público objetivo

Actores, futbolistas, empresarios, influencers y artistas.

##  Justificación

Obtener mejores ingresos y generar exclusividad para la audiencia del hotel.

---

##  Roles del sistema

| Rol | Descripción | Funciones principales |
|---|---|---|
| **Cliente** | Gestiona su estadía desde la aplicación | Registrarse e iniciar sesión · consultar habitaciones, características y precios · reservar, modificar o cancelar · registrar huéspedes acompañantes · solicitar servicios adicionales · consultar sus reservas y el estado de sus pagos |
| **Recepcionista** | Gestiona reservas y atiende a los huéspedes | Consultar y gestionar reservas · crear, modificar o cancelar reservas · registrar y actualizar huéspedes · consultar estado y disponibilidad de habitaciones · check-in y check-out · registrar pagos · gestionar solicitudes de servicios |
| **Administrador** | Administra y supervisa todo el sistema | Gestionar usuarios y roles · CRUD de habitaciones y tipos de habitación · gestionar servicios, precios y disponibilidad · administrar reservas · consultar pagos · gestionar empleados · consultar información general del hotel |

**Interacción:** la información que registra el cliente queda disponible para el recepcionista, quien gestiona la reserva, verifica disponibilidad y realiza el check-in/check-out. El administrador supervisa y administra la información general (usuarios, habitaciones, servicios, precios, reservas y pagos).

---

##  Módulos del sistema

- Autenticación y gestión de usuarios con roles
- Habitaciones y tipos de habitación
- Reservas y huéspedes acompañantes
- Servicios adicionales del hotel
- Check-in y check-out
- Pagos y métodos de pago
- Administración de empleados, precios y disponibilidad

---

##  Base de datos

La base de datos está en **PostgreSQL** y gestiona las operaciones del sistema hotelero. Evita la duplicidad de datos mediante claves primarias y foráneas.

| Grupo | Tablas |
|---|---|
| Usuarios y personas | `roles`, `usuarios`, `clientes`, `empleados`, `huespedes` |
| Alojamiento | `tipos_habitacion`, `habitaciones` |
| Reservas | `reservas`, `reserva_huespedes`, `reserva_servicios`, `servicios` |
| Pagos | `pagos`, `metodos_pago` |
| Estadía | `check_in`, `check_out` |

---

##  Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | [Next.js](https://nextjs.org/) |
| Backend | [Express.js](https://expressjs.com/) (Node.js) |
| Base de datos | [PostgreSQL](https://www.postgresql.org/) |

---

##  Estructura del repositorio

```
Hotel-Laureles/
├── backend/     # API REST con Express.js
├── frontend/    # Aplicación web con Next.js
├── docs/        # Documentación del proyecto
├── .gitignore
└── README.md
```

---

##  Instalación y ejecución

### Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada) y npm
- [PostgreSQL](https://www.postgresql.org/download/)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/kbalantamezu-ops/Hotel-Laureles.git
cd Hotel-Laureles
```

### 2. Base de datos

Crea la base de datos en PostgreSQL y verifica que tenga las tablas del modelo:

```bash
psql -U postgres -c "CREATE DATABASE hotel_laureles;"
```

### 3. Backend (Express.js)

```bash
cd backend
npm install
```

Crea un archivo `.env` dentro de `backend/` con los datos de conexión:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_laureles
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=4000
```

Inicia el servidor:

```bash
npm run dev
```

### 4. Frontend (Next.js)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

> Los archivos `.env` contienen credenciales y no deben subirse al repositorio.

---

##  Estado del proyecto

 En desarrollo.

---

##  Licencia

Proyecto académico desarrollado con fines educativos.
