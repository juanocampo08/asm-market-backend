import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { AuthToken, User, UserRole } from '../../domain/models/User.ts';

const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET');
}

const EXPIRES_IN_SECONDS = Number(process.env['JWT_EXPIRES_IN']) || 3600;

export interface JwtPayloadData {
  id: number;
  role: UserRole;
}

export class JwtService {
  generateToken(user: User): AuthToken {

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET!,
      { expiresIn: EXPIRES_IN_SECONDS }
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: EXPIRES_IN_SECONDS,
    };
  }

  verifyToken(token: string): JwtPayloadData {
    return jwt.verify(token, JWT_SECRET!) as JwtPayloadData;
  }
}