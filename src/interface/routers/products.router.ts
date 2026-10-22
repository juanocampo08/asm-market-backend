import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/products.controller.ts';
import { authenticateToken, soloAdmin } from '../middlewares/auth.middleware.ts';

const router: Router = Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas exclusivas de administrador (sin token -> 401, con token de user -> 403)
router.post('/', authenticateToken, soloAdmin, createProduct);
router.put('/:id', authenticateToken, soloAdmin, updateProduct);
router.delete('/:id', authenticateToken, soloAdmin, deleteProduct);

export default router;