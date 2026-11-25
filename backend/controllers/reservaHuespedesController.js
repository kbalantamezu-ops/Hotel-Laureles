import modelo from '../models/reservaHuespedesModel.js';
import { ROLES } from '../config/roles.js';

const idValido = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

async function cargarReserva(req, res) {
  const reserva = await modelo.reservaPorId(Number(req.params.id));
  if (!reserva) { res.status(404).json({ mensaje: 'La reserva no existe.' }); return null; }
  if (req.usuario.rol === ROLES.CLIENTE && Number(reserva.id_usuario) !== Number(req.usuario.id_usuario)) {
    res.status(403).json({ mensaje: 'No tiene permisos sobre esta reserva.' }); return null;
  }
  return reserva;
}

const listar = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: 'El ID de reserva debe ser un entero positivo.' });
  try {
    if (!await cargarReserva(req, res)) return;
    return res.json(await modelo.listar(Number(req.params.id)));
  } catch (error) {
    console.error('[reserva-huespedes] Error:', error);
    return res.status(500).json({ mensaje: 'Error interno al consultar los acompañantes.' });
  }
};

const validarHuesped = (body) => {
  const errores = [];
  for (const campo of ['nombres', 'apellidos', 'documento']) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) errores.push(`El campo ${campo} es obligatorio.`);
  }
  const maximos = { nombres: 100, apellidos: 100, documento: 30, telefono: 20, correo: 100, nacionalidad: 50 };
  for (const [campo, maximo] of Object.entries(maximos)) {
    if (body[campo] != null && (typeof body[campo] !== 'string' || body[campo].trim().length > maximo)) errores.push(`El campo ${campo} debe tener hasta ${maximo} caracteres.`);
  }
  if (body.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.correo.trim())) errores.push('El correo no tiene un formato válido.');
  return errores;
};

const agregar = async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: 'El ID de reserva debe ser un entero positivo.' });
  const errores = validarHuesped(req.body || {});
  if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  try {
    if (!await cargarReserva(req, res)) return;
    const huesped = await modelo.agregar(Number(req.params.id), req.body);
    return res.status(201).json({ mensaje: 'Acompañante agregado correctamente.', huesped });
  } catch (error) {
    if (error.code === 'RESERVA_NO_EXISTE') return res.status(404).json({ mensaje: error.message });
    if (error.code === 'RESERVA_CERRADA') return res.status(400).json({ mensaje: error.message });
    if (error.code === '23505') return res.status(400).json({ mensaje: 'Ya existe un huésped con ese documento.' });
    console.error('[reserva-huespedes] Error:', error);
    return res.status(500).json({ mensaje: 'Error interno al agregar el acompañante.' });
  }
};

const eliminar = async (req, res) => {
  if (!idValido(req.params.id) || !idValido(req.params.idHuesped)) return res.status(400).json({ mensaje: 'Los IDs deben ser enteros positivos.' });
  try {
    const reserva = await cargarReserva(req, res);
    if (!reserva) return;
    if (['CANCELADA', 'FINALIZADA'].includes(reserva.estado)) {
      return res.status(400).json({ mensaje: 'No se pueden modificar acompañantes de una reserva cancelada o finalizada.' });
    }
    const eliminado = await modelo.eliminar(Number(req.params.id), Number(req.params.idHuesped));
    if (!eliminado) return res.status(404).json({ mensaje: 'No existe ese acompañante en la reserva.' });
    return res.json({ mensaje: 'Acompañante eliminado correctamente.' });
  } catch (error) {
    console.error('[reserva-huespedes] Error:', error);
    return res.status(500).json({ mensaje: 'Error interno al eliminar el acompañante.' });
  }
};

export default { listar, agregar, eliminar };
