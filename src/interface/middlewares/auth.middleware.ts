import type { NextFunction, Request, Response } from 'express';
import { JwtService, type JwtPayloadData } from '../../infrastructure/services/jwt.service.ts';
import type { UserRole } from '../../domain/models/User.ts';

// Extendemos la interfaz Request de Express para que reconozca req.user sin usar 'any'
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadData;
    }
  }
}

const jwtService = new JwtService();

// Middleware de Autenticación: verifica que venga un JWT válido -> si no, 401
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Formato de token inválido' });
    return;
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware de Autorización por Rol: verifica el rol del usuario autenticado -> si no, 403
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'No tienes permisos suficientes para realizar esta acción',
      });
      return;
    }

    next();
  };
};

// Atajo listo para aplicar en las rutas exclusivas de administrador
export const soloAdmin = requireRole('admin');