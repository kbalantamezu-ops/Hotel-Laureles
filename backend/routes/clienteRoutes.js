import { Router } from 'express';
import controlador from '../controllers/clienteController.js';

const router = Router();

router.get('/', controlador.obtenerClientes);
router.get('/:id', controlador.obtenerClientePorId);
router.post('/', controlador.crearCliente);
router.put('/:id', controlador.actualizarCliente);
router.delete('/:id', controlador.eliminarCliente);

export default router;
