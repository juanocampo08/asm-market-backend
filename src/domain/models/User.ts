export type UserRole = 'admin' | 'user';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AuthResponseDTO {
  user: {
    id: number;
    nombre: string;
    email: string;
    role: UserRole;
  };
  token: AuthToken;
}

export interface User {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;