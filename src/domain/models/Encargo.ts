export interface Encargo {
  id: number;
  userId: number;
  productoId: number;
  cantidad: number;
  mensaje: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO';
  createdAt?: Date;
  user?: {
    id: number;
    nombre: string;
    email: string;
  };
  producto?: {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    imagen: string;
  };
}

export interface CreateEncargoDTO {
  userId: number;
  productoId: number;
  cantidad: number;
  mensaje: string;
}