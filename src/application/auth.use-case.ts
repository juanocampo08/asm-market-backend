import type { AuthResponseDTO, LoginDTO } from '../domain/models/User.ts';
import type { IUserRepository } from '../domain/repository/IUser.repository.ts';
import type { BcryptService } from '../infrastructure/services/bcrypt.service.ts';
import type { JwtService } from '../infrastructure/services/jwt.service.ts';
import { BadRequest } from './errors/bad-request.error.ts';
import { UnauthorizedError } from './errors/conflict.error.ts';

export class AuthUseCase {
  private userRepository: IUserRepository;
  private bcryptService: BcryptService;
  private jwtService: JwtService;

  constructor(
    userRepository: IUserRepository,
    bcryptService: BcryptService,
    jwtService: JwtService
  ) {
    this.userRepository = userRepository;
    this.bcryptService = bcryptService;
    this.jwtService = jwtService;
  }

  async loginUser(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = this.bcryptService.decrypt(user.password ?? '', dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.jwtService.generateToken(user);

    return {
      user: {
        id: user.id ?? 0,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async registerUser(payload: Record<string, unknown>) {
    const nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!emailRegex.test(email)) {
      errors.email = 'Ingresa un correo electrónico válido';
    }
    if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequest('Datos de registro inválidos', errors);
    }

    const hashedPassword = this.bcryptService.encrypt(password);

    const createdUser = await this.userRepository.create({
      nombre,
      email,
      password: hashedPassword,
      role: 'user',
      status: 'ACTIVE',
    });

    const token = this.jwtService.generateToken(createdUser);

    return {
      user: {
        id: createdUser.id ?? 0,
        nombre: createdUser.nombre,
        email: createdUser.email,
        role: createdUser.role,
      },
      token,
    };
  }
}