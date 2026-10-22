import type { Request, Response } from 'express';
import type { AuthUseCase } from '../../application/auth.use-case.ts';
import { handleError } from '../middlewares/error.handler.ts';

export class AuthController {
  private authUseCase: AuthUseCase;

  constructor(authUseCase: AuthUseCase) {
    this.authUseCase = authUseCase;
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
        return;
      }

      const result = await this.authUseCase.loginUser({
        email: String(email),
        password: String(password),
      });
      res.status(200).json({ data: result });
    } catch (error) {
      handleError(error, res);
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body ?? {};
      const result = await this.authUseCase.registerUser(payload);
      res.status(201).json({ data: result });
    } catch (error) {
      handleError(error, res);
    }
  };
}