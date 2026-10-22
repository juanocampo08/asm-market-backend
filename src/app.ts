import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';

const app: Express = express()

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

// Ruta para verificar que la API responde
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ASM Market API is running en el puerto que debe de ser...',
  });
});

// Encender el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ASM Market API running on http://localhost:${PORT}`);
});
