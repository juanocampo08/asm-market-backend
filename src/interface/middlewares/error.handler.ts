import type { Response } from 'express';
import { BadRequest } from '../../application/errors/bad-request.error.ts';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../application/errors/conflict.error.ts';

export const handleError = (error: unknown, res: Response) => {
  if (error instanceof BadRequest) {
    return res.status(400).json(error.print());
  }
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({ error: error.message });
  }
  if (error instanceof ForbiddenError) {
    return res.status(403).json({ error: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof ConflictError) {
    return res.status(409).json({ error: error.message });
  }

  console.error('Error no controlado:', error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};