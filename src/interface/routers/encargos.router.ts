import { Router } from 'express';
import {
  createEncargo,
  getAllEncargos,
  getMyEncargos,
} from '../controllers/encargos.controller.ts';
import { authenticateToken, soloAdmin } from '../middlewares/auth.middleware.ts';

const router: Router = Router();

// Usuario autenticado: crear un encargo y consultar solo los suyos
router.post('/', authenticateToken, createEncargo);
router.get('/mias', authenticateToken, getMyEncargos);
router.get('/mios', authenticateToken, getMyEncargos);

// Solo administrador: ver todos los encargos de todos los usuarios
router.get('/', authenticateToken, soloAdmin, getAllEncargos);

export default router;