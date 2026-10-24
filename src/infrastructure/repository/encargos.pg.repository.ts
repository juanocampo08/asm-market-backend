import prisma from './client.ts';
import type { IEncargoRepository } from '../../domain/repository/IEncargo.repository.ts';
import type { CreateEncargoDTO, Encargo } from '../../domain/models/Encargo.ts';

export class EncargoPgRepository implements IEncargoRepository {
  async create(data: CreateEncargoDTO): Promise<Encargo> {
    const created = await prisma.encargos.create({
      data: {
        user_id: data.userId,
        producto_id: data.productoId,
        cantidad: data.cantidad,
        mensaje: data.mensaje,
        estado: 'PENDIENTE',
      },
      include: {
        users: {
          select: { id: true, nombre: true, email: true },
        },
        productos: {
          select: { id: true, nombre: true, categoria: true, precio: true, imagen: true },
        },
      },
    });

    return this.mapToDomain(created);
  }

  async findByUserId(userId: number): Promise<Encargo[]> {
    const rows = await prisma.encargos.findMany({
      where: { user_id: userId },
      include: {
        productos: {
          select: { id: true, nombre: true, categoria: true, precio: true, imagen: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((row) => this.mapToDomain(row));
  }

  async findAll(): Promise<Encargo[]> {
    const rows = await prisma.encargos.findMany({
      include: {
        users: {
          select: { id: true, nombre: true, email: true },
        },
        productos: {
          select: { id: true, nombre: true, categoria: true, precio: true, imagen: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((row) => this.mapToDomain(row));
  }

  async updateEstado(id: number, estado: string): Promise<Encargo | null> {
    const existing = await prisma.encargos.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await prisma.encargos.update({
      where: { id },
      data: { estado },
      include: {
        users: {
          select: { id: true, nombre: true, email: true },
        },
        productos: {
          select: { id: true, nombre: true, categoria: true, precio: true, imagen: true },
        },
      },
    });

    return this.mapToDomain(updated);
  }

  private mapToDomain(raw: {
    id: number;
    user_id: number;
    producto_id: number;
    cantidad: number;
    mensaje: string;
    estado: string;
    created_at: Date;
    users?: { id: number; nombre: string; email: string };
    productos?: { id: number; nombre: string; categoria: string; precio: number; imagen: string };
  }): Encargo {
    return {
      id: raw.id,
      userId: raw.user_id,
      productoId: raw.producto_id,
      cantidad: raw.cantidad,
      mensaje: raw.mensaje,
      estado: raw.estado as 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO',
      createdAt: raw.created_at,
      ...(raw.users && { user: raw.users }),
      ...(raw.productos && { producto: raw.productos }),
    };
  }
}