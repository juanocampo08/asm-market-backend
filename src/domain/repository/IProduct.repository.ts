import type {
  CreateProductDTO,
  Product,
  ProductFilterOptions,
  UpdateProductDTO,
} from '../models/Product.ts';

export interface IProductRepository {
  findAll(filters?: ProductFilterOptions): Promise<{ data: Product[]; total: number }>;
  findById(id: number): Promise<Product | null>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: number, data: UpdateProductDTO): Promise<Product | null>;
  softDelete(id: number): Promise<boolean>;
}