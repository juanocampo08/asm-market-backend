import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './interface/routers/auth.router.ts';
import productsRoutes from './interface/routers/products.router.ts';
import encargosRoutes from './interface/routers/encargos.router.ts';

const app: Express = express();

// Middlewares globales
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://asm-market.vercel.app',
    ],
  })
);

// Ruta de verificación de estado
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ASM Market API is running',
  });
});

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/productos', productsRoutes);
app.use('/api/encargos', encargosRoutes);

// Encender el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ASM Market API running on http://localhost:${PORT}`);
});

export default app;