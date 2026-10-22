import type { CreateUserDTO, User } from '../models/User.ts';

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}