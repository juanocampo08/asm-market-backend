import type { CreateEncargoDTO, Encargo } from '../models/Encargo.ts';

export interface IEncargoRepository {
  create(data: CreateEncargoDTO): Promise<Encargo>;
  findByUserId(userId: number): Promise<Encargo[]>;
  findAll(): Promise<Encargo[]>;
  updateEstado(id: number, estado: string): Promise<Encargo | null>;
}