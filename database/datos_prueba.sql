-- =========================================================
-- DATOS DE PRUEBA - HOTEL LOS LAURELES
-- Se ejecuta DESPUÉS de "Script Hotel laureles.sql"
-- =========================================================

-- Usuarios (hash dummy: no hay autenticación en la Tarea 3)
INSERT INTO usuarios (id_rol, nombre_usuario, correo, password_hash, estado) VALUES
(3, 'admin.laureles', 'admin@laureles.com', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummy', 'ACTIVO'),
(2, 'recep.maria', 'maria@laureles.com', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummy', 'ACTIVO'),
(1, 'cliente.juan', 'juan@correo.com', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummy', 'ACTIVO'),
(1, 'cliente.camila', 'camila@correo.com', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummy', 'ACTIVO'),
(1, 'cliente.pedro', 'pedro@correo.com', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummy', 'ACTIVO');

-- Clientes
INSERT INTO clientes (id_usuario, documento, telefono, direccion, fecha_nacimiento) VALUES
(3, '1144098765', '3105550101', 'Calle 5 # 12-34, Cali', '1990-04-12'),
(4, '1112223344', '3205550202', 'Carrera 10 # 20-30, Cali', '1995-08-25'),
(5, '5566778899', '3155550303', 'Avenida 4N # 8-15, Cali', '1988-11-03');

-- Tipos de habitación
INSERT INTO tipos_habitacion (nombre, descripcion, capacidad, precio_noche) VALUES
('Estándar', 'Habitación cómoda con cama doble y baño privado', 2, 180000),
('Suite', 'Suite con sala, jacuzzi y vista a la ciudad', 4, 420000),
('Presidencial', 'Suite de lujo con servicios premium y terraza', 6, 750000);

-- Habitaciones
INSERT INTO habitaciones (id_tipo_habitacion, numero, piso, estado, descripcion) VALUES
(1, '101', 1, 'DISPONIBLE', 'Habitación estándar primer piso'),
(1, '102', 1, 'OCUPADA', 'Habitación estándar primer piso'),
(2, '201', 2, 'DISPONIBLE', 'Suite con vista a la ciudad'),
(3, '301', 3, 'Mantenimiento', 'Suite presidencial con terraza');

-- Reservas
INSERT INTO reservas (id_cliente, id_habitacion, fecha_entrada, fecha_salida, cantidad_huespedes, estado, observaciones, total) VALUES
(1, 1, '2026-11-10', '2026-11-12', 2, 'CONFIRMADA', 'Llegada en la tarde', 360000),
(2, 3, '2026-11-15', '2026-11-18', 4, 'PENDIENTE', 'Celebración de aniversario', 1260000),
(3, 2, '2026-11-05', '2026-11-08', 2, 'CHECKIN', 'Huesped en el hotel', 540000);
