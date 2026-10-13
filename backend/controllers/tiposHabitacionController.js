// =========================================================
// CAPA CONTROLADOR - tabla "tipos_habitacion"
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

import modelo from '../models/tiposHabitacionModel.js';

// ---------------------------------------------------------
// Funciones auxiliares de validación
// ---------------------------------------------------------

// Valida que el ID de la URL sea un número entero positivo
const esIdValido = (valor) => {
  return /^\d+$/.test(valor) && Number(valor) > 0;
};

// Valida los datos para CREAR (POST): todos los campos son obligatorios
const validarParaCrear = (body) => {
  const errores = [];

  if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    errores.push('El campo "nombre" es obligatorio y debe ser un texto.');
  } else if (body.nombre.trim().length > 50) {
    errores.push('El campo "nombre" no puede superar los 50 caracteres.');
  }

  if (!Number.isInteger(body.capacidad) || body.capacidad <= 0) {
    errores.push('El campo "capacidad" debe ser un número entero mayor a 0.');
  }

  if (
    typeof body.precio_noche !== 'number' ||
    Number.isNaN(body.precio_noche) ||
    body.precio_noche < 0
  ) {
    errores.push('El campo "precio_noche" debe ser un número mayor o igual a 0.');
  }

  if (
    body.descripcion !== undefined &&
    body.descripcion !== null &&
    typeof body.descripcion !== 'string'
  ) {
    errores.push('El campo "descripcion" debe ser un texto.');
  } else if (
    typeof body.descripcion === 'string' &&
    body.descripcion.length > 255
  ) {
    errores.push('El campo "descripcion" no puede superar los 255 caracteres.');
  }

  return errores;
};

// Valida los datos para ACTUALIZAR (PUT): al menos un campo válido,
// y si el campo viene, debe ser correcto.
const validarParaActualizar = (body) => {
  const errores = [];
  const campos = ['nombre', 'descripcion', 'capacidad', 'precio_noche'];

  // El PUT debe traer al menos uno de los campos del recurso
  const algunoEnviado = campos.some((campo) => body[campo] !== undefined);
  if (!algunoEnviado) {
    errores.push(
      'Debe enviar al menos uno de los campos: nombre, descripcion, capacidad, precio_noche.'
    );
    return errores; // no tiene sentido seguir validando
  }

  if (body.nombre !== undefined) {
    if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
      errores.push('El campo "nombre" debe ser un texto no vacío.');
    } else if (body.nombre.trim().length > 50) {
      errores.push('El campo "nombre" no puede superar los 50 caracteres.');
    }
  }

  if (body.capacidad !== undefined) {
    if (!Number.isInteger(body.capacidad) || body.capacidad <= 0) {
      errores.push('El campo "capacidad" debe ser un número entero mayor a 0.');
    }
  }

  if (body.precio_noche !== undefined) {
    if (
      typeof body.precio_noche !== 'number' ||
      Number.isNaN(body.precio_noche) ||
      body.precio_noche < 0
    ) {
      errores.push('El campo "precio_noche" debe ser un número mayor o igual a 0.');
    }
  }

  if (body.descripcion !== undefined && body.descripcion !== null) {
    if (typeof body.descripcion !== 'string') {
      errores.push('El campo "descripcion" debe ser un texto.');
    } else if (body.descripcion.length > 255) {
      errores.push('El campo "descripcion" no puede superar los 255 caracteres.');
    }
  }

  return errores;
};

// Devuelve 500 en cualquier error inesperado (caída de BD, etc.)
const responderError500 = (res, err) => {
  console.error('[tipos_habitacion] Error:', err);
  return res.status(500).json({
    mensaje: 'Error interno del servidor al consultar la base de datos.',
  });
};

// ---------------------------------------------------------
// GET /api/tipos-habitacion -> consultar todos  (200)
// ---------------------------------------------------------
const obtenerTipos = async (req, res) => {
  try {
    const tipos = await modelo.obtenerTodos();
    return res.status(200).json(tipos);
  } catch (err) {
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// GET /api/tipos-habitacion/:id -> consultar por ID (200 / 400 / 404)
// ---------------------------------------------------------
const obtenerTipoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // ID que no sea número entero positivo -> 400
    if (!esIdValido(id)) {
      return res.status(400).json({
        mensaje: 'El ID debe ser un número entero positivo.',
      });
    }

    const tipo = await modelo.obtenerPorId(Number(id));

    // No existe -> 404
    if (!tipo) {
      return res.status(404).json({
        mensaje: `No existe un tipo de habitación con ID ${id}.`,
      });
    }

    return res.status(200).json(tipo);
  } catch (err) {
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// POST /api/tipos-habitacion -> crear (201 / 400)
// ---------------------------------------------------------
const crearTipo = async (req, res) => {
  try {
    const errores = validarParaCrear(req.body || {});

    // Datos faltantes o inválidos -> 400
    if (errores.length > 0) {
      return res.status(400).json({
        mensaje: 'Datos inválidos.',
        errores,
      });
    }

    const nuevo = await modelo.crear({
      nombre: req.body.nombre.trim(),
      descripcion:
        req.body.descripcion === undefined || req.body.descripcion === null
          ? null
          : req.body.descripcion.trim(),
      capacidad: req.body.capacidad,
      precio_noche: req.body.precio_noche,
    });

    // Recurso creado -> 201
    return res.status(201).json({
      mensaje: 'Tipo de habitación creado correctamente.',
      tipo: nuevo,
    });
  } catch (err) {
    // 23505 = violación de clave única (nombre repetido)
    if (err.code === '23505') {
      return res.status(400).json({
        mensaje: 'Ya existe un tipo de habitación con ese nombre.',
      });
    }
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// PUT /api/tipos-habitacion/:id -> actualizar (200 / 400 / 404)
// ---------------------------------------------------------
const actualizarTipo = async (req, res) => {
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
    if (req.body.nombre !== undefined) datos.nombre = req.body.nombre.trim();
    if (req.body.capacidad !== undefined) datos.capacidad = req.body.capacidad;
    if (req.body.precio_noche !== undefined)
      datos.precio_noche = req.body.precio_noche;
    if (req.body.descripcion !== undefined)
      datos.descripcion =
        req.body.descripcion === null ? null : req.body.descripcion.trim();

    const actualizado = await modelo.actualizar(Number(id), datos);

    // El ID no existe -> 404
    if (!actualizado) {
      return res.status(404).json({
        mensaje: `No existe un tipo de habitación con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: 'Tipo de habitación actualizado correctamente.',
      tipo: actualizado,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({
        mensaje: 'Ya existe un tipo de habitación con ese nombre.',
      });
    }
    return responderError500(res, err);
  }
};

// ---------------------------------------------------------
// DELETE /api/tipos-habitacion/:id -> eliminar (200 / 400 / 404)
// ---------------------------------------------------------
const eliminarTipo = async (req, res) => {
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
        mensaje: `No existe un tipo de habitación con ID ${id}.`,
      });
    }

    return res.status(200).json({
      mensaje: `Tipo de habitación con ID ${id} eliminado correctamente.`,
    });
  } catch (err) {
    // 23503 = violación de clave foránea (habitaciones que usan este tipo)
    if (err.code === '23503') {
      return res.status(400).json({
        mensaje:
          'No se puede eliminar: existen habitaciones que usan este tipo de habitación.',
      });
    }
    return responderError500(res, err);
  }
};

export default {
  obtenerTipos,
  obtenerTipoPorId,
  crearTipo,
  actualizarTipo,
  eliminarTipo,
};
