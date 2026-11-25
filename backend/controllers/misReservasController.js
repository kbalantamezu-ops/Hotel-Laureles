import modelo from '../models/misReservasModel.js';

const idValido = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
async function verificarPropietario(req, res) {
  const idPropietario = await modelo.propietario(Number(req.params.id));
  if (idPropietario == null) { res.status(404).json({ mensaje: 'La reserva no existe.' }); return false; }
  if (Number(idPropietario) !== Number(req.usuario.id_usuario)) {
    res.status(403).json({ mensaje: 'No tiene permisos sobre esta reserva.' }); return false;
  }
  return true;
}
const fechaValida = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  return fecha.getUTCFullYear() === y && fecha.getUTCMonth() === m - 1 && fecha.getUTCDate() === d;
};

function validar(body, parcial = false) {
  const errores = [];
  if (!parcial || body.id_habitacion !== undefined) {
    if (!Number.isInteger(body.id_habitacion) || body.id_habitacion < 1) errores.push('Seleccione una habitación válida.');
  }
  if (!parcial || body.fecha_entrada !== undefined) {
    if (!fechaValida(body.fecha_entrada)) errores.push('La fecha de entrada debe tener formato YYYY-MM-DD.');
  }
  if (!parcial || body.fecha_salida !== undefined) {
    if (!fechaValida(body.fecha_salida)) errores.push('La fecha de salida debe tener formato YYYY-MM-DD.');
  }
  if (body.fecha_entrada && body.fecha_salida && body.fecha_salida <= body.fecha_entrada) errores.push('La fecha de salida debe ser posterior a la fecha de entrada.');
  if (!parcial || body.cantidad_huespedes !== undefined) {
    if (!Number.isInteger(body.cantidad_huespedes) || body.cantidad_huespedes < 1) errores.push('La cantidad de huéspedes debe ser un entero mayor que cero.');
  }
  if (body.observaciones !== undefined && body.observaciones !== null && (typeof body.observaciones !== 'string' || body.observaciones.length > 255)) errores.push('Las observaciones deben ser texto de hasta 255 caracteres.');
  return errores;
}

function errorModelo(res, error) {
  if (error.code === 'CLIENTE_NO_EXISTE') return res.status(400).json({ mensaje: error.message });
  if (error.code === 'HABITACION_NO_DISPONIBLE') return res.status(400).json({ mensaje: error.message });
  if (error.code === 'RESERVA_NO_MODIFICABLE') return res.status(400).json({ mensaje: error.message });
  if (error.code === '23514' || error.code === '23503') return res.status(400).json({ mensaje: 'Los datos de la reserva no son válidos.' });
  console.error('[mis-reservas] Error:', error);
  return res.status(500).json({ mensaje: 'Error interno al procesar la reserva.' });
}

const listar = async (req, res) => {
  try { return res.json(await modelo.listarPorUsuario(req.usuario.id_usuario)); }
  catch (error) { return errorModelo(res, error); }
};

const consultar = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: 'El ID debe ser un entero positivo.' });
  try {
    if (!await verificarPropietario(req, res)) return;
    const reserva = await modelo.obtenerPorUsuario(Number(req.params.id), req.usuario.id_usuario);
    if (!reserva) return res.status(404).json({ mensaje: 'No existe una reserva propia con ese ID.' });
    return res.json(reserva);
  } catch (error) { return errorModelo(res, error); }
};

const crear = async (req, res) => {
  const errores = validar(req.body || {});
  if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  try {
    const reserva = await modelo.crear(req.usuario.id_usuario, req.body);
    return res.status(201).json({ mensaje: 'Reserva creada correctamente.', reserva });
  } catch (error) { return errorModelo(res, error); }
};

const actualizar = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: 'El ID debe ser un entero positivo.' });
  const body = req.body || {};
  const permitidos = ['id_habitacion', 'fecha_entrada', 'fecha_salida', 'cantidad_huespedes', 'observaciones'];
  if (!permitidos.some((campo) => body[campo] !== undefined)) return res.status(400).json({ mensaje: 'Indique al menos un campo modificable.' });
  if (['id_cliente', 'estado', 'total'].some((campo) => body[campo] !== undefined)) return res.status(400).json({ mensaje: 'El cliente no puede cambiar el propietario, el estado ni el total de la reserva.' });
  const errores = validar(body, true);
  if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  try {
    if (!await verificarPropietario(req, res)) return;
    const resultado = await modelo.actualizar(Number(req.params.id), req.usuario.id_usuario, body);
    if (resultado.noEncontrada) return res.status(404).json({ mensaje: 'No existe una reserva propia con ese ID.' });
    return res.json({ mensaje: 'Reserva actualizada correctamente.', reserva: resultado.reserva });
  } catch (error) { return errorModelo(res, error); }
};

const cancelar = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: 'El ID debe ser un entero positivo.' });
  try {
    if (!await verificarPropietario(req, res)) return;
    const resultado = await modelo.cancelar(Number(req.params.id), req.usuario.id_usuario);
    if (!resultado) return res.status(400).json({ mensaje: 'La reserva no existe, no es propia o ya no se puede cancelar.' });
    return res.json({ mensaje: 'Reserva cancelada correctamente.' });
  } catch (error) { return errorModelo(res, error); }
};

export default { listar, consultar, crear, actualizar, cancelar };
