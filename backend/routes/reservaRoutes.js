// =========================================================
// CAPA RUTAS - tabla "reservas"
// Define las URLs del recurso y asocia cada una con su
// función del controlador. No contiene lógica de negocio.
//
//   GET    /api/reservas       -> consultar todos
//   GET    /api/reservas/:id   -> consultar por ID
//   POST   /api/reservas       -> crear
//   PUT    /api/reservas/:id   -> actualizar
//   DELETE /api/reservas/:id   -> eliminar
// =========================================================

import { Router } from 'express';
import controlador from '../controllers/reservaController.js';

const router = Router();

// Consultar todas las reservas
router.get('/', controlador.obtenerReservas);

// Consultar una reserva por su ID
router.get('/:id', controlador.obtenerReservaPorId);

// Crear una nueva reserva
router.post('/', controlador.crearReserva);

// Actualizar una reserva existente
router.put('/:id', controlador.actualizarReserva);

// Eliminar una reserva
router.delete('/:id', controlador.eliminarReserva);

export default router;
