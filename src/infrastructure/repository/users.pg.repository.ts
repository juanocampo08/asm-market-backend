import prisma from './client.ts';
import type { IUserRepository } from '../../domain/repository/IUser.repository.ts';
import type { CreateUserDTO, User, UserRole } from '../../domain/models/User.ts';
import { ConflictError } from '../../application/errors/conflict.error.ts';

export class UserPgRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const existUser = await this.findByEmail(data.email);
    if (existUser) {
      throw new ConflictError(`Ya existe un usuario registrado con el correo ${data.email}`);
    }

    const created = await prisma.users.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: data.password ?? '',
        role: data.role,
        status: data.status ?? 'ACTIVE',
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.users.findFirst({
      where: { id, status: 'ACTIVE' },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  private mapToDomain(raw: {
    id: number;
    nombre: string;
    email: string;
    password: string;
    role: string;
    status: string;
    created_at: Date;
  }): User {
    return {
      id: raw.id,
      nombre: raw.nombre,
      email: raw.email,
      password: raw.password,
      role: raw.role as UserRole,
      status: (raw.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      createdAt: raw.created_at,
    };
  }
}