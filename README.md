# ASM Market — Backend API REST (Entrega 3)

API RESTful desarrollada con **Node.js, Express 5, TypeScript, Prisma 7 y PostgreSQL (Supabase)** para **ASM Market**, una tienda especializada en la curaduría e importación de productos originales de belleza (*Beauty*), bienestar (*Vitaminas*) y moda (*Fashion*) desde Estados Unidos hacia Colombia.

## 🔗 Enlaces de Despliegue y Repositorios

- **Repositorio Backend:** [https://github.com/juanocampo08/asm-market-backend](https://github.com/juanocampo08/asm-market-backend)
- **Repositorio Frontend:** [https://github.com/juanocampo08/asm-market-frontend](https://github.com/juanocampo08/asm-market-frontend)
- **URL de la API en producción (Render):** *(pendiente de pegar tras desplegar)*
- **URL del Sitio Web en producción (Vercel):** *(pendiente de pegar tras desplegar)*

---

## 🔑 Credenciales de Prueba (Creadas por el `seed`)

Para evaluar los flujos de autenticación y autorización por roles (`admin` y `user`), la base de datos cuenta con los siguientes usuarios de prueba:

| Rol | Correo electrónico | Contraseña | Permisos principales |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin@asmmarket.com` | `Admin123*` | Gestión completa del catálogo (`POST`, `PUT`, `DELETE /api/productos`), consulta global de encargos (`GET /api/encargos`) y cambio de estado (`PATCH /api/encargos/:id/estado`). |
| **`user`** | `cliente@asmmarket.com` | `Cliente123*` | Creación de encargos personalizados (`POST /api/encargos`) y lectura exclusiva de sus propios encargos (`GET /api/encargos/mios`). |

---

## ⚙️ Cómo ejecutar el proyecto en local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/juanocampo08/asm-market-backend.git
   cd asm-market-backend
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz basándote en `.env.example`:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://usuario:password@host:5432/postgres"
   JWT_SECRET="tu_secreto_jwt_seguro"
   JWT_EXPIRES_IN=3600
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Generar el cliente de Prisma, sincronizar el esquema y poblar la base de datos (`seed`):**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
   La API quedará disponible en `http://localhost:3001`.

---

## 🏛️ Arquitectura en 4 Capas

El proyecto sigue la separación estricta de responsabilidades vista en clase:
- **`src/domain/`**: Entidades de negocio (`User`, `Product`, `Encargo`) e interfaces de repositorios (`IUserRepository`, `IProductRepository`, `IEncargoRepository`).
- **`src/application/`**: Casos de uso (`AuthUseCase`, `ProductsUseCase`, `EncargosUseCase`) y errores de dominio (`BadRequest`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`).
- **`src/infrastructure/`**: Cliente de Prisma 7 con adaptador `@prisma/adapter-pg`, repositorios PostgreSQL y servicios de encriptación (`BcryptService`) y firma de tokens (`JwtService`).
- **`src/interface/`**: Controladores HTTP, routers de Express y middlewares de seguridad (`authenticateToken`, `soloAdmin`, `handleError`).

---

## 🧠 Decisiones Técnicas (En mis propias palabras)

### 1. Flujo completo de un Login hasta que una ruta protegida responde
1. El usuario ingresa su correo y contraseña en el formulario de `/login`. El componente `AuthView` valida el formato y llama a `useAuth().login()`, que invoca a `authService.login()` y envía un `POST /api/auth/login` mediante nuestro cliente central `apiRequest`.
2. En el backend, `auth.controller.ts` delega en `AuthUseCase.login()`. Este busca al usuario por email en PostgreSQL mediante `UserPgRepository` y compara la contraseña en texto plano contra el hash almacenado usando `bcrypt.compare()`.
3. Si las credenciales coinciden, `JwtService` firma un token JWT con expiración (`expiresIn: 3600`) y un *payload* mínimo `{ id, role }`, devolviendo `{ user, token }` sin incluir jamás el campo `password`.
4. El frontend guarda la sesión con `tokenStorage.saveSession()` tanto en `localStorage` como en las cookies `auth_token` y `auth_role`.
5. Cuando el usuario navega a una vista privada como `/mis-encargos`, `apiRequest` lee el token y lo adjunta automáticamente en el header `Authorization: Bearer <token>` hacia `GET /api/encargos/mios`.
6. En el backend, el middleware `authenticateToken` verifica la firma y vigencia del JWT con `JWT_SECRET`, inyecta `req.user = { id, role }` y el controlador consulta en Prisma únicamente los encargos cuyo `user_id` coincide con `req.user.id`.

### 2. ¿Dónde guardo el token en el frontend y qué riesgo tiene esa decisión?
Guardo el token en `localStorage` (para que nuestro cliente HTTP `apiRequest` pueda leerlo e inyectarlo en el header `Authorization: Bearer <token>`) y además sincronizo una cookie `auth_token` (`SameSite=Lax`) para que el middleware de servidor `src/proxy.ts` de Next.js pueda proteger las rutas antes de renderizarlas.
El principal riesgo de almacenar tokens accesibles desde JavaScript (`localStorage` o cookies sin `HttpOnly`) es la vulnerabilidad ante ataques **XSS (*Cross-Site Scripting*)**: si un script malicioso lograra ejecutarse en el navegador, podría leer el `localStorage` y robar el token de sesión. Para mitigar esto, evitamos usar `dangerouslySetInnerHTML`, escapamos todas las entradas con React y configuramos tiempos de expiración cortos (`1 hora`) en el JWT.

### 3. ¿En qué caso mi API responde `401` y en cuál `403`? Ejemplo real del proyecto
- **`401 Unauthorized` (Falta de autenticación):** Ocurre cuando el cliente no demuestra quién es. Por ejemplo, si alguien envía `POST /api/encargos` sin el header `Authorization` (o con un JWT expirado/alterado), el middleware `authenticateToken` corta la petición y responde `401`, o si alguien falla su contraseña en `POST /api/auth/login`.
- **`403 Forbidden` (Falta de permisos/autorización):** Ocurre cuando el servidor **sí sabe quién es el usuario** (su token JWT es válido), pero su rol no tiene permiso para esa acción. Por ejemplo, cuando `cliente@asmmarket.com` (rol `user`) envía su token válido a `DELETE /api/productos/1` o a `GET /api/encargos`, pasa `authenticateToken` pero el middleware `soloAdmin` verifica que `req.user.role !== 'admin'` y rechaza la operación con `403 Forbidden`.

### 4. Uso de Inteligencia Artificial y correcciones realizadas
Utilicé herramientas de IA como apoyo para maquetar la línea gráfica editorial en Figma y estructurar el esqueleto repetitivo de las capas. Durante el desarrollo tuve que corregir varios detalles técnicos importantes:
1. **Sincronización de rutas y contratos entre Frontend y Backend:** El servicio inicial del frontend apuntaba a `/api/products` y enviaba `producto_id`/`detalles`, mientras que nuestro backend en Express exponía `/api/productos` y validaba `productoId`/`mensaje`. También corregí un doble `JSON.stringify` en los servicios porque el cliente `http.ts` ya serializaba el `body`.
2. **Reglas estrictas de React 19 y Next.js 16:** En Next.js 16.4 con React 19, el linter bloqueaba las llamadas síncronas a `setState` dentro de `useEffect` (`react-hooks/set-state-in-effect`) y el uso de `window.location.href` para redirecciones internas; lo solucionamos despachando la carga inicial con `queueMicrotask` y usando `useRouter().replace()`.
3. **Configuración de Prisma 7 con Supabase:** En Prisma 7 ya no se define `url = env("DATABASE_URL")` dentro de `schema.prisma`, sino en `prisma.config.ts` junto con el adaptador `@prisma/adapter-pg`, y tuvimos que usar el *Session Pooler* IPv4 de Supabase en el puerto `5432`.

---

## 🌐 Captura de Petición Protegida (Pestaña Network con Header `Authorization`)

![Captura Network Authorization](./network-auth.png)