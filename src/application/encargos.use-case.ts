import type { IEncargoRepository } from '../domain/repository/IEncargo.repository.ts';
import type { IProductRepository } from '../domain/repository/IProduct.repository.ts';
import { BadRequest } from './errors/bad-request.error.ts';
import { NotFoundError } from './errors/conflict.error.ts';

export class EncargosUseCase {
  private encargoRepository: IEncargoRepository;
  private productRepository: IProductRepository;

  constructor(encargoRepository: IEncargoRepository, productRepository: IProductRepository) {
    this.encargoRepository = encargoRepository;
    this.productRepository = productRepository;
  }

  async create(userId: number, payload: Record<string, unknown>) {
    const productoId = Number(payload.productoId);
    const cantidad = payload.cantidad !== undefined ? Number(payload.cantidad) : 1;
    const mensaje = typeof payload.mensaje === 'string' ? payload.mensaje.trim() : '';

    const errors: Record<string, string> = {};

    if (!Number.isInteger(productoId) || productoId <= 0) {
      errors.productoId = 'Debes seleccionar un producto válido del catálogo';
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      errors.cantidad = 'La cantidad debe ser al menos 1 unidad';
    }
    if (mensaje.length < 10) {
      errors.mensaje = 'Cuéntanos los detalles del encargo (mínimo 10 caracteres)';
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequest('Datos del encargo inválidos', errors);
    }

    const product = await this.productRepository.findById(productoId);
    if (!product) {
      throw new NotFoundError(`El producto con ID ${productoId} no existe`);
    }

    const created = await this.encargoRepository.create({
      userId,
      productoId,
      cantidad,
      mensaje,
    });

    return {
      message: 'Encargo registrado exitosamente',
      data: created,
    };
  }

  async getMyEncargos(userId: number) {
    const data = await this.encargoRepository.findByUserId(userId);
    return { data };
  }

  async getAllEncargos() {
    const data = await this.encargoRepository.findAll();
    return { data };
  }
  async updateEstado(id: number, payload: Record<string, unknown>) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequest('El ID del encargo debe ser un número entero positivo');
    }

    const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'ENTREGADO'];
    const estado = typeof payload.estado === 'string' ? payload.estado.trim().toUpperCase() : '';

    if (!estadosValidos.includes(estado)) {
      throw new BadRequest('El estado debe ser PENDIENTE, EN_PROCESO o ENTREGADO', {
        estado: 'Estado inválido',
      });
    }

    const updated = await this.encargoRepository.updateEstado(id, estado);
    if (!updated) {
      throw new NotFoundError(`Encargo con ID ${id} no encontrado`);
    }

    return {
      message: 'Estado del encargo actualizado exitosamente',
      data: updated,
    };
  }
}