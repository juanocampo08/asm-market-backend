import type { Request, Response } from 'express';
import { EncargoPgRepository } from '../../infrastructure/repository/encargos.pg.repository.ts';
import { ProductPgRepository } from '../../infrastructure/repository/products.pg.repository.ts';
import { EncargosUseCase } from '../../application/encargos.use-case.ts';
import { handleError } from '../middlewares/error.handler.ts';

const encargoRepository = new EncargoPgRepository();
const productRepository = new ProductPgRepository();
const useCase = new EncargosUseCase(encargoRepository, productRepository);

export const createEncargo = async (req: Request, res: Response): Promise<void> => {
  try {
    // El userId SIEMPRE sale del token verificado por el middleware, nunca del body
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const response = await useCase.create(userId, req.body ?? {});
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const getMyEncargos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const response = await useCase.getMyEncargos(userId);
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const getAllEncargos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const response = await useCase.getAllEncargos();
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};