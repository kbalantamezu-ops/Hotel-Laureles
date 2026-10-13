-- =========================================================
-- BASE DE DATOS - HOTEL LOS LAURELES
-- PostgreSQL
-- =========================================================

-- =========================================================
-- 1. ROLES
-- =========================================================
CREATE TABLE roles (
    id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- =========================================================
-- 2. USUARIOS
-- =========================================================
CREATE TABLE usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_rol INTEGER NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================================================
-- 3. CLIENTES
-- =========================================================
CREATE TABLE clientes (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    fecha_nacimiento DATE,

    CONSTRAINT fk_clientes_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================================================
-- 4. EMPLEADOS
-- =========================================================
CREATE TABLE empleados (
    id_empleado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    cargo VARCHAR(50) NOT NULL,
    fecha_contratacion DATE,

    CONSTRAINT fk_empleados_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================================================
-- 5. TIPOS DE HABITACION
-- =========================================================
CREATE TABLE tipos_habitacion (
    id_tipo_habitacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    capacidad INTEGER NOT NULL,
    precio_noche NUMERIC(12,2) NOT NULL,

    CONSTRAINT chk_tipo_capacidad
        CHECK (capacidad > 0),

    CONSTRAINT chk_tipo_precio
        CHECK (precio_noche >= 0)
);

-- =========================================================
-- 6. HABITACIONES
-- =========================================================
CREATE TABLE habitaciones (
    id_habitacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tipo_habitacion INTEGER NOT NULL,
    numero VARCHAR(10) NOT NULL UNIQUE,
    piso INTEGER NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    descripcion VARCHAR(255),

    CONSTRAINT fk_habitaciones_tipo
        FOREIGN KEY (id_tipo_habitacion)
        REFERENCES tipos_habitacion(id_tipo_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_habitacion_piso
        CHECK (piso >= 0)
);

-- =========================================================
-- 7. RESERVAS
-- =========================================================
CREATE TABLE reservas (
    id_reserva INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_habitacion INTEGER NOT NULL,
    fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    cantidad_huespedes INTEGER NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(255),
    total NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_reservas_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_reservas_habitacion
        FOREIGN KEY (id_habitacion)
        REFERENCES habitaciones(id_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_reserva_fechas
        CHECK (fecha_salida > fecha_entrada),

    CONSTRAINT chk_reserva_huespedes
        CHECK (cantidad_huespedes > 0),

    CONSTRAINT chk_reserva_total
        CHECK (total >= 0)
);

-- =========================================================
-- 8. HUESPEDES
-- =========================================================
CREATE TABLE huespedes (
    id_huesped INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    nacionalidad VARCHAR(50)
);

-- =========================================================
-- 9. RESERVA_HUESPEDES
-- =========================================================
CREATE TABLE reserva_huespedes (
    id_reserva INTEGER NOT NULL,
    id_huesped INTEGER NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (id_reserva, id_huesped),

    CONSTRAINT fk_reserva_huespedes_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_reserva_huespedes_huesped
        FOREIGN KEY (id_huesped)
        REFERENCES huespedes(id_huesped)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================================================
-- 10. SERVICIOS
-- =========================================================
CREATE TABLE servicios (
    id_servicio INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    precio NUMERIC(12,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT chk_servicio_precio
        CHECK (precio >= 0)
);

-- =========================================================
-- 11. RESERVA_SERVICIOS
-- =========================================================
CREATE TABLE reserva_servicios (
    id_reserva INTEGER NOT NULL,
    id_servicio INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,

    PRIMARY KEY (id_reserva, id_servicio),

    CONSTRAINT fk_reserva_servicios_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_reserva_servicios_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_reserva_servicios_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_reserva_servicios_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_reserva_servicios_subtotal
        CHECK (subtotal >= 0)
);

-- =========================================================
-- 12. METODOS_PAGO
-- =========================================================
CREATE TABLE metodos_pago (
    id_metodo_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
);

-- =========================================================
-- 13. PAGOS
-- =========================================================
CREATE TABLE pagos (
    id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva INTEGER NOT NULL,
    id_metodo_pago INTEGER NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto NUMERIC(12,2) NOT NULL,
    referencia VARCHAR(100),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT fk_pagos_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_pagos_metodo
        FOREIGN KEY (id_metodo_pago)
        REFERENCES metodos_pago(id_metodo_pago)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_pago_monto
        CHECK (monto > 0)
);

-- =========================================================
-- 14. CHECK_INS
-- =========================================================
CREATE TABLE check_ins (
    id_check_in INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva INTEGER NOT NULL UNIQUE,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(255),
    realizado_por INTEGER NOT NULL,

    CONSTRAINT fk_checkin_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_checkin_empleado
        FOREIGN KEY (realizado_por)
        REFERENCES empleados(id_empleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================================================
-- 15. CHECK_OUTS
-- =========================================================
CREATE TABLE check_outs (
    id_check_out INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reserva INTEGER NOT NULL UNIQUE,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(255),
    realizado_por INTEGER NOT NULL,

    CONSTRAINT fk_checkout_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reservas(id_reserva)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_checkout_empleado
        FOREIGN KEY (realizado_por)
        REFERENCES empleados(id_empleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================================================
-- DATOS INICIALES - ROLES
-- =========================================================
INSERT INTO roles (nombre, descripcion) VALUES
('Cliente', 'Usuario que reserva habitaciones y gestiona su estadía'),
('Recepcionista', 'Encargado de gestionar reservas, check-in y check-out'),
('Administrador', 'Supervisa el funcionamiento general del sistema');