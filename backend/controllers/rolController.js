// =========================================================
// CONTROLADOR DE ROLES
// Catálogo usado por el formulario de usuarios del panel admin.
// =========================================================

import rolModel from '../models/rolModel.js';

const listar = async (req, res) => {
  try {
    const roles = await rolModel.obtenerTodos();
    return res.status(200).json(roles);
  } catch (err) {
    console.error('[roles] Error al listar:', err);
    return res.status(500).json({
      mensaje: 'Error interno del servidor al consultar los roles.',
    });
  }
};

export default { listar };
