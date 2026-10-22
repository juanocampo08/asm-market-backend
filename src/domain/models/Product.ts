export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
  state: 'ACTIVE' | 'REMOVED';
  createdAt?: Date;
}

export type CreateProductDTO = Omit<Product, 'id' | 'state' | 'createdAt'>;
export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface ProductFilterOptions {
  categoria?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  page?: number;
  limit?: number;
  offset?: number;
}