import modelo from '../models/clienteModel.js';

const esIdValido = (valor) => /^\d+$/.test(valor) && Number(valor) > 0;

const esFechaValida = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const validarDatos = (body, crear = false) => {
  const errores = [];

  if (crear || body.id_usuario !== undefined) {
    if (!Number.isInteger(body.id_usuario) || body.id_usuario <= 0) {
      errores.push('El campo "id_usuario" debe ser un número entero mayor a 0.');
    }
  }

  if (crear || body.documento !== undefined) {
    if (typeof body.documento !== 'string' || body.documento.trim() === '') {
      errores.push('El campo "documento" es obligatorio y debe ser un texto.');
    } else if (body.documento.trim().length > 30) {
      errores.push('El campo "documento" no puede superar los 30 caracteres.');
    }
  }

  for (const [campo, maximo] of [
    ['telefono', 20],
    ['direccion', 150],
  ]) {
    if (body[campo] !== undefined && body[campo] !== null) {
      if (typeof body[campo] !== 'string') {
        errores.push(`El campo "${campo}" debe ser un texto o null.`);
      } else if (body[campo].length > maximo) {
        errores.push(`El campo "${campo}" no puede superar los ${maximo} caracteres.`);
      }
    }
  }

  if (
    body.fecha_nacimiento !== undefined &&
    body.fecha_nacimiento !== null &&
    !esFechaValida(body.fecha_nacimiento)
  ) {
    errores.push('El campo "fecha_nacimiento" debe ser una fecha válida con formato AAAA-MM-DD o null.');
  }

  if (!crear) {
    const campos = [
      'id_usuario',
      'documento',
      'telefono',
      'direccion',
      'fecha_nacimiento',
    ];
    if (!campos.some((campo) => body[campo] !== undefined)) {
      errores.push('Debe enviar al menos uno de los campos: id_usuario, documento, telefono, direccion, fecha_nacimiento.');
    }
  }
  return errores;
};

const responderError500 = (res, err) => {
  console.error('[clientes] Error:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al consultar la base de datos.',
  });
};

const obtenerClientes = async (req, res) => {
  try {
    return res.status(200).json(await modelo.obtenerTodos());
  } catch (err) {
    return responderError500(res, err);
  }
};

const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ mensaje: 'El ID debe ser un número entero positivo.' });
    }
    const cliente = await modelo.obtenerPorId(Number(id));
    if (!cliente) {
      return res.status(404).json({ mensaje: `No existe un cliente con ID ${id}.` });
    }
    return res.status(200).json(cliente);
  } catch (err) {
    return responderError500(res, err);
  }
};

const crearCliente = async (req, res) => {
  try {
    const body = req.body || {};
    const errores = validarDatos(body, true);
    if (errores.length) {
      return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
    }
    const nuevo = await modelo.crear({
      id_usuario: body.id_usuario,
      documento: body.documento.trim(),
      telefono: body.telefono == null ? null : body.telefono.trim(),
      direccion: body.direccion == null ? null : body.direccion.trim(),
      fecha_nacimiento: body.fecha_nacimiento ?? null,
    });
    return res.status(201).json({ mensaje: 'Cliente creado correctamente.', cliente: nuevo });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({
        mensaje: 'El usuario ya tiene un cliente asociado o el documento ya está registrado.',
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: 'El usuario indicado no existe.' });
    }
    return responderError500(res, err);
  }
};

const actualizarCliente = async (req, res) => {
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
    if (body.id_usuario !== undefined) datos.id_usuario = body.id_usuario;
    if (body.documento !== undefined) datos.documento = body.documento.trim();
    for (const campo of ['telefono', 'direccion']) {
      if (body[campo] !== undefined) {
        datos[campo] = body[campo] === null ? null : body[campo].trim();
      }
    }
    if (body.fecha_nacimiento !== undefined) {
      datos.fecha_nacimiento = body.fecha_nacimiento;
    }

    const actualizado = await modelo.actualizar(Number(id), datos);
    if (!actualizado) {
      return res.status(404).json({ mensaje: `No existe un cliente con ID ${id}.` });
    }
    return res.status(200).json({ mensaje: 'Cliente actualizado correctamente.', cliente: actualizado });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({
        mensaje: 'El usuario ya tiene un cliente asociado o el documento ya está registrado.',
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({ mensaje: 'El usuario indicado no existe.' });
    }
    return responderError500(res, err);
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    if (!esIdValido(id)) {
      return res.status(400).json({ mensaje: 'El ID debe ser un número entero positivo.' });
    }
    const eliminado = await modelo.eliminar(Number(id));
    if (!eliminado) {
      return res.status(404).json({ mensaje: `No existe un cliente con ID ${id}.` });
    }
    return res.status(200).json({ mensaje: `Cliente con ID ${id} eliminado correctamente.` });
  } catch (err) {
    if (err.code === '23503' || err.code === '23001') {
      return res.status(400).json({
        mensaje: 'No se puede eliminar el cliente porque tiene reservas asociadas.',
      });
    }
    return responderError500(res, err);
  }
};

export default {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
