import type {
  CreateProductDTO,
  ProductFilterOptions,
  UpdateProductDTO,
} from '../domain/models/Product.ts';
import type { IProductRepository } from '../domain/repository/IProduct.repository.ts';
import { BadRequest } from './errors/bad-request.error.ts';
import { NotFoundError } from './errors/conflict.error.ts';

const CATEGORIAS_VALIDAS = ['Beauty', 'Vitaminas', 'Fashion'];

export class ProductsUseCase {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async getAll(filters: ProductFilterOptions = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 6;
    const offset = limit * (page - 1);

    const searchOptions: ProductFilterOptions = {
      ...filters,
      state: 'ACTIVE',
      page,
      limit,
      offset,
    };

    const { data, total } = await this.productRepository.findAll(searchOptions);

    return {
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      data,
    };
  }

  async getById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequest('El ID del producto debe ser un número entero positivo');
    }

    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    return { data: product };
  }

  async create(payload: Record<string, unknown>) {
    const nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : '';
    const categoria = typeof payload.categoria === 'string' ? payload.categoria.trim() : '';
    const precio = Number(payload.precio);
    const descripcion = typeof payload.descripcion === 'string' ? payload.descripcion.trim() : '';
    const imagen = typeof payload.imagen === 'string' ? payload.imagen.trim() : '';

    const errors: Record<string, string> = {};
    if (nombre.length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      errors.categoria = 'La categoría debe ser Beauty, Vitaminas o Fashion';
    }
    if (!Number.isFinite(precio) || precio <= 0) {
      errors.precio = 'El precio debe ser un número mayor a 0';
    }
    if (descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    if (!imagen) {
      errors.imagen = 'La URL o ruta de la imagen es obligatoria';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequest('Datos del producto inválidos', errors);
    }

    const dto: CreateProductDTO = {
      nombre,
      categoria,
      precio: Math.round(precio),
      descripcion,
      imagen,
    };

    const created = await this.productRepository.create(dto);
    return { message: 'Producto creado exitosamente', data: created };
  }

  async update(id: number, payload: Record<string, unknown>) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequest('El ID del producto debe ser un número entero positivo');
    }

    const updateData: UpdateProductDTO = {};
    const errors: Record<string, string> = {};

    if (payload.nombre !== undefined) {
      const nombre = String(payload.nombre).trim();
      if (nombre.length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres';
      else updateData.nombre = nombre;
    }

    if (payload.categoria !== undefined) {
      const categoria = String(payload.categoria).trim();
      if (!CATEGORIAS_VALIDAS.includes(categoria)) {
        errors.categoria = 'La categoría debe ser Beauty, Vitaminas o Fashion';
      } else {
        updateData.categoria = categoria;
      }
    }

    if (payload.precio !== undefined) {
      const precio = Number(payload.precio);
      if (!Number.isFinite(precio) || precio <= 0) {
        errors.precio = 'El precio debe ser un número mayor a 0';
      } else {
        updateData.precio = Math.round(precio);
      }
    }

    if (payload.descripcion !== undefined) {
      const descripcion = String(payload.descripcion).trim();
      if (descripcion.length < 10) {
        errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
      } else {
        updateData.descripcion = descripcion;
      }
    }

    if (payload.imagen !== undefined) {
      const imagen = String(payload.imagen).trim();
      if (!imagen) errors.imagen = 'La imagen no puede estar vacía';
      else updateData.imagen = imagen;
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequest('Datos de actualización inválidos', errors);
    }

    const updated = await this.productRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    return { message: 'Producto actualizado exitosamente', data: updated };
  }

  async deleteById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequest('El ID del producto debe ser un número entero positivo');
    }

    const deleted = await this.productRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    return { message: 'Producto eliminado exitosamente' };
  }
}