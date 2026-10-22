import prisma from './client.ts';
import type { IProductRepository } from '../../domain/repository/IProduct.repository.ts';
import type {
  CreateProductDTO,
  Product,
  ProductFilterOptions,
  UpdateProductDTO,
} from '../../domain/models/Product.ts';

export class ProductPgRepository implements IProductRepository {
  async findAll(filters?: ProductFilterOptions): Promise<{ data: Product[]; total: number }> {
    const whereClause: Record<string, unknown> = {
      state: filters?.state ?? 'ACTIVE',
    };

    if (filters?.categoria && filters.categoria !== 'todos') {
      whereClause.categoria = filters.categoria;
    }

    if (filters?.search) {
      whereClause.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const precioFilter: Record<string, number> = {};
      if (filters.minPrice !== undefined) precioFilter.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) precioFilter.lte = filters.maxPrice;
      whereClause.precio = precioFilter;
    }

    const total = await prisma.productos.count({ where: whereClause });
    const rows = await prisma.productos.findMany({
      where: whereClause,
      take: filters?.limit ?? 6,
      skip: filters?.offset ?? 0,
      orderBy: { id: 'asc' },
    });

    return {
      data: rows.map((row) => this.mapToDomain(row)),
      total,
    };
  }

  async findById(id: number): Promise<Product | null> {
    const row = await prisma.productos.findFirst({
      where: { id, state: 'ACTIVE' },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const created = await prisma.productos.create({
      data: {
        nombre: data.nombre,
        categoria: data.categoria,
        precio: data.precio,
        descripcion: data.descripcion,
        imagen: data.imagen,
        state: 'ACTIVE',
      },
    });
    return this.mapToDomain(created);
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = await prisma.productos.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.categoria !== undefined && { categoria: data.categoria }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.imagen !== undefined && { imagen: data.imagen }),
      },
    });
    return this.mapToDomain(updated);
  }

  async softDelete(id: number): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await prisma.productos.update({
      where: { id },
      data: { state: 'REMOVED' },
    });
    return true;
  }

  private mapToDomain(raw: {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    descripcion: string;
    imagen: string;
    state: string;
    created_at: Date;
  }): Product {
    return {
      id: raw.id,
      nombre: raw.nombre,
      categoria: raw.categoria,
      precio: raw.precio,
      descripcion: raw.descripcion,
      imagen: raw.imagen,
      state: (raw.state as 'ACTIVE' | 'REMOVED') ?? 'ACTIVE',
      createdAt: raw.created_at,
    };
  }
}