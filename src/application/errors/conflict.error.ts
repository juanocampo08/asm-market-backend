// 409 Conflict — registrar un email que ya existe
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 401 Unauthorized — credenciales inválidas o token ausente/inválido
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 403 Forbidden — token válido pero sin permisos suficientes 
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// 404 Not Found — recurso no encontrado
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}