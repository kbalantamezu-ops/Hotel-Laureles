// =========================================================
// CAPA CONTROLADOR - tabla "reservas"
// Recibe la petición HTTP, valida los datos, llama al modelo
// y devuelve la respuesta en JSON con el código HTTP correcto:
//
//   200 -> OK (consulta, actualización o eliminación exitosa)
//   201 -> Recurso creado
//   400 -> Petición inválida (datos faltantes o mal formados)
//   404 -> Recurso no encontrado
//   500 -> Error interno del servidor (falla de la base de datos)
//
// No hay autenticación: todos los endpoints son públicos.
// =========================================================

import modelo from '../models/reservaModel.js';

// ---------------------------------------------------------
// Funciones auxiliares de validación
// ---------------------------------------------------------

// Valida que el ID de la URL sea un número entero positivo
const esIdValido = (valor) => {
  return /^\d+$/.test(valor) && Number(valor) > 0;
};

// Valida una fecha con formato exacto YYYY-MM-DD y que sea real
// (evita fechas como 2026-02-31 que otros parsers aceptan)
const esFechaValida = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
};

// Valida los datos para CREAR (POST): todos los campos obligatorios
// menos estado, observaciones y fecha_reserva (la genera la BD)
const validarParaCrear = (body) => {
  const errores = [];

  if (!Number.isInteger(body.id_cliente) || body.id_cliente <= 0) {
    errores.push('El campo "id_cliente" debe ser un número entero mayor a 0.');
  }

  if (!Number.isInteger(body.id_habitacion) || body.id_habitacion <= 0) {
    errores.push(
      'El campo "id_habitacion" debe ser un número entero mayor a 0.'
    );
  }

  if (!esFechaValida(body.fecha_entrada)) {
    errores.push(
      'El campo "fecha_entrada" es obligatorio y debe tener formato YYYY-MM-DD.'
    );
  }

  if (!esFechaValida(body.fecha_salida)) {
    errores.push(
      'El campo "fecha_salida" es obligatorio y debe tener formato YYYY-MM-DD.'
    );
  } else if (
    esFechaValida(body.fecha_entrada) &&
    body.fecha_salida <= body.fecha_entrada
  ) {
    errores.push('La fecha de salida debe ser posterior a la fecha de entrada.');
  }

  if (!Number.isInteger(body.cantidad_huespedes) || body.cantidad_huespedes <= 0) {
    errores.push(
      'El campo "cantidad_huespedes" debe ser un número entero mayor a 0.'
    );
  }

  if (
    typeof body.total !== 'number' ||
    Number.isNaN(body.total) ||
    body.total < 0
  ) {
    errores.push('El campo "total" debe ser un número mayor o igual a 0.');
  }

  if (
    body.estado !== undefined &&
    body.estado !== null &&
    typeof body.estado !== 'string'
  ) {
    errores.push('El campo "estado" debe ser un texto.');
  } else if (
    typeof body.estado === 'string' &&
    body.estado.trim().length > 30
  ) {
    errores.push('El campo "estado" no puede superar los 30 caracteres.');
  }

  if (
    body.observaciones !== undefined &&
    body.observaciones !== null &&
    typeof body.observaciones !== 'string'
  ) {
    errores.push('El campo "observaciones" debe ser un texto.');
  } else if (
    typeof body.observaciones === 'string' &&
    body.observaciones.length > 255
  ) {
    errores.push('El campo "observaciones" no puede superar los 255 caracteres.');
  }

  return errores;
};

// Valida los datos para ACTUALIZAR (PUT): al menos un campo válido,
// y si el campo viene, debe ser correcto.
const validarParaActualizar = (body) => {
  const errores = [];
  const campos = [
    'id_cliente',
    'id_habitacion',
    'fecha_entrada',
    'fecha_salida',
    'cantidad_huespedes',
    'estado',
    'observaciones',
    'total',
  ];

  // El PUT debe traer al menos uno de los campos del recurso
  const algunoEnviado = campos.some((campo) => body[campo] !== undefined);
  if (!algunoEnviado) {
    errores.push(
      'Debe enviar al menos uno de los campos: id_cliente, id_habitacion, fecha_entrada, fecha_salida, cantidad_huespedes, estado, observaciones, total.'
    );
    return errores; // no tiene sentido seguir validando
  }

  if (body.id_cliente !== undefined) {
    if (!Number.isInteger(body.id_cliente) || body.id_cliente <= 0) {
      errores.push('El campo "id_cliente" debe ser un número entero mayor a 0.');
    }
  }

  if (body.id_habitacion !== undefined) {
    if (!Number.isInteger(body.id_habitacion) || body.id_habitacion <= 0) {
      errores.push(
        'El campo "id_habitacion" debe ser un número entero mayor a 0.'
      );
    }
  }

  if (body.fecha_entrada !== undefined && !esFechaValida(body.fecha_entrada)) {
    errores.push('El campo "fecha_entrada" debe tener formato YYYY-MM-DD.');
  }

  if (body.fecha_salida !== undefined) {
    if (!esFechaValida(body.fecha_salida)) {
      errores.push('El campo "fecha_salida" debe tener formato YYYY-MM-DD.');
    } else if (
      esFechaValida(body.fecha_entrada) &&
      body.fecha_salida <= body.fecha_entrada
    ) {
      errores.push(
        'La fecha de salida debe ser posterior a la fecha de entrada.'
      );
    }
  }

  if (body.cantidad_huespedes !== undefined) {
    if (!Number.isInteger(body.cantidad_huespedes) || body.cantidad_huespedes <= 0) {
      errores.push(
        'El campo "cantidad_huespedes" debe ser un número entero mayor a 0.'
      );
    }
  }

  if (body.total !== undefined) {
    if (typeof body.total !== 'number' || Number.isNaN(body.total) || body.total < 0) {
      errores.push('El campo "total" debe ser un número mayor o igual a 0.');
    }
  }

  if (body.estado !== undefined && body.estado !== null) {
    if (typeof body.estado !== 'string') {
      errores.push('El campo "estado" debe ser un texto.');
    } else if (body.estado.trim().length > 30) {
      errores.push('El campo "estado" no puede superar los 30 caracteres.');
    }
  }

  if (body.observaciones !== undefined && body.observaciones !== null) {
    if (typeof body.observaciones !== 'string') {
      errores.push('El campo "observaciones" debe ser un texto.');
    } else if (body.observaciones.length > 255) {
      errores.push(
        'El campo "observaciones" no puede superar los 255 caracteres.'
      );
    }
  }

  return errores;
};

// Devuelve 500 en cualquier error inesperado (caída de BD, etc.)
const responderError500 = (res, err) => {
  console.error('[reservas] Error:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al consultar la base de datos.',
  });
};

// ---------------------------------------------------------
// GET /api/reservas -> consultar todos  (200)
// ---------------------------------------------------------
const obtenerReservas = async (req, res) => {
  try {
    const reservas = await modelo.obtenerTodos();
    return res.status(200).json(reservas);
  } catch (err) {
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// GET /api/reservas/:id -> consultar por ID (200 / 400 / 404)
// ---------------------------------------------------------
const obtenerReservaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // ID que no sea número entero positivo -> 400
    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const reserva = await modelo.obtenerPorId(Number(id));

    // No existe -> 404
    if (!reserva) {
      return res.status(404).json({
        mensaje: `No existe una reserva con ID ${id}.`,
      });
    }

    return res.status(200).json(reserva);
  } catch (err) {
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// POST /api/reservas -> crear (201 / 400)
// ---------------------------------------------------------
const crearReserva = async (req, res) => {
  try {
    const errores = validarParaCrear(req.body || {});

    // Datos faltantes o inválidos -> 400
    if (errores.length > 0) {
      return res.status(400).json({
        mensaje: 'Datos inválidos.',
        errores,
      });
    }

    const nueva = await modelo.crear({
      id_cliente: req.body.id_cliente,
      id_habitacion: req.body.id_habitacion,
      fecha_entrada: req.body.fecha_entrada,
      fecha_salida: req.body.fecha_salida,
      cantidad_huespedes: req.body.cantidad_huespedes,
      estado:
        req.body.estado === undefined || req.body.estado === null
          ? 'PENDIENTE'
          : req.body.estado.trim(),
      observaciones:
        req.body.observaciones === undefined || req.body.observaciones === null
          ? null
          : req.body.observaciones.trim(),
      total: req.body.total,
    });

    // Recurso creado -> 201
    return res.status(201).json({
      mensaje: 'Reserva creada correctamente.',
      reserva: nueva,
    });
  } catch (err) {
    // 23503 = violación de clave foránea (cliente o habitación inexistente)
    if (err.code === '23503') {
      return res.status(400).json({
        mensaje:
          'No se puede crear la reserva: el cliente o la habitación indicados no existen.',
      });
    }
    // 23514 = violación de CHECK (fechas, huéspedes o total)
    if (err.code === '23514') {
      return res.status(400).json({
        mensaje:
          'Los datos infringen una restricción de la base de datos (fechas, cantidad de huéspedes o total).',
      });
    }
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// PUT /api/reservas/:id -> actualizar (200 / 400 / 404)
// ---------------------------------------------------------
const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const errores = validarParaActualizar(req.body || {});
    if (errores.length > 0) {
      return res.status(400).json({
        mensaje: 'Datos inválidos.',
        errores,
      });
    }

    // Se limpian los valores antes de mandarlos al modelo
    const datos = {};
    if (req.body.id_cliente !== undefined) datos.id_cliente = req.body.id_cliente;
    if (req.body.id_habitacion !== undefined)
      datos.id_habitacion = req.body.id_habitacion;
    if (req.body.fecha_entrada !== undefined)
      datos.fecha_entrada = req.body.fecha_entrada;
    if (req.body.fecha_salida !== undefined)
      datos.fecha_salida = req.body.fecha_salida;
    if (req.body.cantidad_huespedes !== undefined)
      datos.cantidad_huespedes = req.body.cantidad_huespedes;
    if (req.body.total !== undefined) datos.total = req.body.total;
    if (req.body.estado !== undefined)
      datos.estado =
        req.body.estado === null ? null : req.body.estado.trim();
    if (req.body.observaciones !== undefined)
      datos.observaciones =
        req.body.observaciones === null
          ? null
          : req.body.observaciones.trim();

    const actualizado = await modelo.actualizar(Number(id), datos);

    // El ID no existe -> 404
    if (!actualizado) {
      return res.status(404).json({
        mensaje: `No existe una reserva con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: 'Reserva actualizada correctamente.',
      reserva: actualizado,
    });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({
        mensaje:
          'No se puede actualizar la reserva: el cliente o la habitación indicados no existen.',
      });
    }
    if (err.code === '23514') {
      return res.status(400).json({
        mensaje:
          'Los datos infringen una restricción de la base de datos (fechas, cantidad de huéspedes o total).',
      });
    }
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// DELETE /api/reservas/:id -> eliminar (200 / 400 / 404)
// ---------------------------------------------------------
const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const eliminado = await modelo.eliminar(Number(id));

    // El ID no existe -> 404
    if (!eliminado) {
      return res.status(404).json({
        mensaje: `No existe una reserva con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: `Reserva con ID ${id} eliminada correctamente.`,
    });
  } catch (err) {
    // 23503 = violación de clave foránea; 23001 = restricción ON DELETE RESTRICT
    // (pagos o check-ins de la reserva impiden el borrado)
    if (err.code === '23503' || err.code === '23001') {
      return res.status(400).json({
        mensaje:
          'No se puede eliminar: la reserva tiene pagos, check-ins o check-outs asociados.',
      });
    }
    return responderError500(res, err);
  }
};

export default {
  obtenerReservas,
  obtenerReservaPorId,
  crearReserva,
  actualizarReserva,
  eliminarReserva,
};
