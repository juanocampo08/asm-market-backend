import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { AuthUseCase } from '../../application/auth.use-case.ts';
import { UserPgRepository } from '../../infrastructure/repository/users.pg.repository.ts';
import { BcryptService } from '../../infrastructure/services/bcrypt.service.ts';
import { JwtService } from '../../infrastructure/services/jwt.service.ts';

const router: Router = Router();

const userRepository = new UserPgRepository();
const bcryptService = new BcryptService();
const jwtService = new JwtService();
const authUseCase = new AuthUseCase(userRepository, bcryptService, jwtService);
const authController = new AuthController(authUseCase);

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;