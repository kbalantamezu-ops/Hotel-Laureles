// Controlador del CRUD de habitaciones.
import modelo from '../models/habitacionModel.js';

const esIdValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const validarDatos = (body, crear = false) => {
  const errores = [];

  if (crear || body.id_tipo_habitacion !== undefined) {
    if (!Number.isInteger(body.id_tipo_habitacion) || body.id_tipo_habitacion <= 0) {
      errores.push('El campo "id_tipo_habitacion" debe ser un número entero mayor a 0.');
    }
  }

  if (crear || body.numero !== undefined) {
    if (typeof body.numero !== 'string' || body.numero.trim() === '') {
      errores.push('El campo "numero" es obligatorio y debe ser un texto.');
    } else if (body.numero.trim().length > 10) {
      errores.push('El campo "numero" no puede superar los 10 caracteres.');
    }
  }

  if (crear || body.piso !== undefined) {
    if (!Number.isInteger(body.piso) || body.piso < 0) {
      errores.push('El campo "piso" debe ser un entero mayor o igual a 0.');
    }
  }

  if (body.estado !== undefined) {
    if (typeof body.estado !== 'string' || body.estado.trim() === '') {
      errores.push('El campo "estado" debe ser un texto no vacío.');
    } else if (body.estado.trim().length > 30) {
      errores.push('El campo "estado" no puede superar los 30 caracteres.');
    }
  }

  if (body.descripcion !== undefined && body.descripcion !== null) {
    if (typeof body.descripcion !== 'string') {
      errores.push('El campo "descripcion" debe ser un texto o null.');
    } else if (body.descripcion.length > 255) {
      errores.push('El campo "descripcion" no puede superar los 255 caracteres.');
    }
  }

  if (!crear) {
    const campos = ['id_tipo_habitacion', 'numero', 'piso', 'estado', 'descripcion'];
    if (!campos.some((campo) => body[campo] !== undefined)) {
      errores.push('Debe enviar al menos uno de los campos: id_tipo_habitacion, numero, piso, estado, descripcion.');
    }
  }
  return errores;
};

const responderError500 = (res, err) => {
  console.error('[habitaciones] Error:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al consultar la base de datos.',
  });
};

const obtenerHabitaciones = async (req, res) => {
  try {
    return res.status(200).json(await modelo.obtenerTodos());
  } catch (err) {
    return responderError500(res, err);
  }
};

const obtenerHabitacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ mensaje: 'El ID debe ser un número entero positivo.' });
    }
    const habitacion = await modelo.obtenerPorId(Number(id));
    if (!habitacion) {
      return res.status(404).json({ mensaje: `No existe una habitación con ID ${id}.` });
    }
    return res.status(200).json(habitacion);
  } catch (err) {
    return responderError500(res, err);
  }
};

const crearHabitacion = async (req, res) => {
  try {
    const body = req.body || {};
    const errores = validarDatos(body, true);
    if (errores.length) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }
    const nueva = await modelo.crear({
      id_tipo_habitacion: body.id_tipo_habitacion,
      numero: body.numero.trim(),
      piso: body.piso,
      estado: body.estado === undefined ? 'DISPONIBLE' : body.estado.trim(),
      descripcion:
        body.descripcion === undefined || body.descripcion === null
          ? null
          : body.descripcion.trim(),
    });
    return res.status(201).json({ mensaje: 'Habitación creada correctamente.', habitacion: nueva });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ mensaje: 'Ya existe una habitación con ese número.' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: 'El tipo de habitación indicado no existe.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ mensaje: 'El piso debe ser mayor o igual a 0.' });
    }
    return responderError500(res, err);
  }
};

const actualizarHabitacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ mensaje: 'El ID debe ser un número entero positivo.' });
    }
    const body = req.body || {};
    const errores = validarDatos(body);
    if (errores.length) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }

    const datos = {};
    for (const campo of ['id_tipo_habitacion', 'piso']) {
      if (body[campo] !== undefined) datos[campo] = body[campo];
    }
    if (body.numero !== undefined) datos.numero = body.numero.trim();
    if (body.estado !== undefined) datos.estado = body.estado.trim();
    if (body.descripcion !== undefined) {
      datos.descripcion = body.descripcion === null ? null : body.descripcion.trim();
    }

    const actualizado = await modelo.actualizar(Number(id), datos);
    if (!actualizado) {
      return res.status(404).json({ mensaje: `No existe una habitación con ID ${id}.` });
    }
    return res.status(200).json({ mensaje: 'Habitación actualizada correctamente.', habitacion: actualizado });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ mensaje: 'Ya existe una habitación con ese número.' });
    }
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: 'El tipo de habitación indicado no existe.' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ mensaje: 'El piso debe ser mayor o igual a 0.' });
    }
    return responderError500(res, err);
  }
};

const eliminarHabitacion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ mensaje: 'El ID debe ser un número entero positivo.' });
    }
    const eliminado = await modelo.eliminar(Number(id));
    if (!eliminado) {
      return res.status(404).json({ mensaje: `No existe una habitación con ID ${id}.` });
    }
    return res.status(200).json({ mensaje: `Habitación con ID ${id} eliminada correctamente.` });
  } catch (err) {
    if (err.code === '23503' || err.code === '23001') {
      return res.status(400).json({ mensaje: 'No se puede eliminar: existen reservas asociadas a esta habitación.' });
    }
    return responderError500(res, err);
  }
};

export default {
  obtenerHabitaciones,
  obtenerHabitacionPorId,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion,
};
