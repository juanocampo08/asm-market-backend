import type { Request, Response } from 'express';
import type { ProductFilterOptions } from '../../domain/models/Product.ts';
import type { IProductRepository } from '../../domain/repository/IProduct.repository.ts';
import { ProductPgRepository } from '../../infrastructure/repository/products.pg.repository.ts';
import { ProductsUseCase } from '../../application/products.use-case.ts';
import { handleError } from '../middlewares/error.handler.ts';

const repository: IProductRepository = new ProductPgRepository();
const useCase = new ProductsUseCase(repository);

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: ProductFilterOptions = {};

    if (req.query.page !== undefined) {
      const page = Number(req.query.page);
      if (!Number.isInteger(page) || page <= 0) {
        res.status(400).json({ error: 'El parámetro page debe ser un entero positivo' });
        return;
      }
      filters.page = page;
    }

    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit <= 0) {
        res.status(400).json({ error: 'El parámetro limit debe ser un entero positivo' });
        return;
      }
      filters.limit = limit;
    }

    if (typeof req.query.categoria === 'string' && req.query.categoria.trim() !== '') {
      filters.categoria = req.query.categoria.trim();
    }

    if (typeof req.query.search === 'string' && req.query.search.trim() !== '') {
      filters.search = req.query.search.trim();
    }

    if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
      const minPrice = Number(req.query.minPrice);
      if (!Number.isFinite(minPrice) || minPrice < 0) {
        res.status(400).json({ error: 'El parámetro minPrice debe ser un número válido' });
        return;
      }
      filters.minPrice = minPrice;
    }

    if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
      const maxPrice = Number(req.query.maxPrice);
      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        res.status(400).json({ error: 'El parámetro maxPrice debe ser un número válido' });
        return;
      }
      filters.maxPrice = maxPrice;
    }

    const response = await useCase.getAll(filters);
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const response = await useCase.getById(id);
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await useCase.create(req.body ?? {});
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const response = await useCase.update(id, req.body ?? {});
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const response = await useCase.deleteById(id);
    res.status(200).json(response);
  } catch (error) {
    handleError(error, res);
  }
};