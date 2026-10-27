# Around The U.S.

Aplicación web full-stack para compartir lugares memorables mediante tarjetas con fotografías. Cada persona puede registrarse, iniciar sesión, editar su perfil y su avatar, agregar tarjetas, dar o quitar "me gusta" y eliminar las tarjetas que ha creado.

Este repositorio reúne en un solo proyecto el front end (React + Vite) y la API (Express), y está **desplegado en Vercel con una base de datos MongoDB Atlas alojada en AWS**. En este sprint la API dejó de depender de la autenticación provisional y de la API de TripleTen: ahora **la autenticación es propia, segura y se ejecuta en el back end**.

## Despliegue en producción

| Parte | Tecnología | URL |
| --- | --- | --- |
| Front end | React + Vite en Vercel | https://web-project-around-client.vercel.app |
| API | Express en Vercel (función serverless) | https://web-project-around-full-eight.vercel.app |
| Base de datos | MongoDB Atlas (clúster serverless en AWS) | Conexión privada mediante `MONGODB_URI` |

Comprobación rápida de que la API está viva (no requiere token ni consulta la base de datos):

```bash
curl https://web-project-around-full-eight.vercel.app/health
# {"status":"ok"}
```

## Arquitectura

```
┌────────────────────┐   HTTPS + JWT    ┌────────────────────┐    mongodb+srv    ┌──────────────────┐
│  Front end (Vite)  │ ───────────────▶ │  API (Express 5)   │ ────────────────▶ │  MongoDB Atlas   │
│  Vercel · client/  │ ◀─────────────── │  Vercel · server/  │ ◀──────────────── │  (AWS)           │
└────────────────────┘      CORS        └────────────────────┘                   └──────────────────┘
```

Flujo de autenticación:

```
/signup  → bcrypt (hash + salt) → usuario en MongoDB
/signin  → bcrypt.compare → JWT firmado (7 días) → localStorage del navegador
Resto de rutas → header Authorization: Bearer <token> → middleware auth → controlador
```

## Lo aplicado del Sprint 16

El proyecto sigue los tres bloques del sprint: autenticación en el back end, seguridad y despliegue.

### 1. Autenticación con JWT y contraseñas protegidas

- **Registro (`POST /signup`):** valida que lleguen `email` y `password` como texto, exige un mínimo de **8 caracteres** *antes* de hashear (la regla se aplica a la contraseña original, no al hash) y guarda la contraseña con **bcrypt** (`bcrypt`, 10 rondas de sal). Un correo repetido responde **409** gracias al índice único (`unique: true`, error `11000` de MongoDB manejado en el controlador).
- **Inicio de sesión (`POST /signin`):** busca al usuario, compara con `bcrypt.compare` y entrega un **JWT** (HS256, expira en 7 días) cuyo payload solo lleva el `_id`. El payload está codificado, no cifrado, por eso no contiene datos sensibles.
- **Mismo mensaje para "correo inexistente" y "contraseña incorrecta"** (401) y comparación contra un hash de relleno cuando el usuario no existe, para no revelar qué correos están registrados ni por el mensaje ni por el tiempo de respuesta.
- **Middleware `auth`:** exige `Authorization: Bearer <token>`, verifica firma y expiración con `jwt.verify` (algoritmo fijado a HS256) y deja la identidad en `req.user`. Se monta después de `/signup` y `/signin`, así que **todo lo demás queda protegido** por defecto.
- **El hash nunca sale del servidor:** el campo `password` tiene `select: false` y las respuestas pasan por listas blancas (`toPublicUser` / `toOwnUser`), de modo que el correo solo lo ve su dueño.

### 2. Autorización y propiedad de los recursos

- Cada tarjeta guarda su `owner` (`ObjectId` con `ref` al modelo `User`), que **siempre sale del token**, nunca del cuerpo de la petición.
- `GET /cards` filtra por propietario, y borrar, dar y quitar "me gusta" pasan por una única función (`findOwnedCard`) que comprueba **existencia (404) y después propiedad (403)**, porque responder 403 a un id inexistente confirmaría que la tarjeta existe. Filtrar el listado no sustituye esa comprobación: cada operación la repite.
- Los "me gusta" se escriben con `$addToSet` / `$pull` (atómicos y sin duplicados), con el propietario también en el filtro de la escritura.
- Las rutas `/users/me` actúan siempre sobre el id del token: no existe una forma de pedir editar el perfil de otra persona.
- Códigos usados: **401** (no autenticado), **403** (autenticado sin permiso), **404** (no existe), **409** (correo duplicado), **429** (demasiados intentos).

### 3. Validación y manejo de errores en el servidor

- Presencia, tipo y formato se validan en el back end, no solo en el navegador: esquemas de Mongoose (longitudes, `required`, `match` para el correo, validador de URL) y `runValidators: true` en las actualizaciones.
- Un **`errorHandler` central** traduce `CastError` y `ValidationError` a 400, deja el detalle completo en el log del servidor y responde un mensaje genérico en los 500, para no filtrar información interna.
- La configuración falla al arrancar si falta una variable obligatoria (`requireEnv`), en lugar de descubrirlo en la primera petición.

### 4. Rate limiting

Con `express-rate-limit`, antes del controlador de cada ruta sensible:

| Ruta | Límite | Detalle |
| --- | --- | --- |
| `POST /signin` | 10 intentos / 15 min | Solo cuentan los intentos fallidos (`skipSuccessfulRequests`) |
| `POST /signup` | 5 registros / hora | Cuenta todo: cada alta crea un documento y gasta un hash bcrypt |

Al superarlo responde **429** con el mismo formato `{ message }` que el resto de errores. Por defecto los contadores viven en la memoria de cada instancia, así que en un entorno serverless son un freno razonable, no un límite global exacto.

### 5. Preparación para producción y despliegue

- **`app.set("trust proxy", 1)`:** detrás del proxy de Vercel, el rate limiter identifica a cada visitante por su IP real y no por la del proxy.
- **Pool de conexiones acotado** (`maxPoolSize: 10`) y `serverSelectionTimeoutMS: 5000`: cada instancia serverless abre su propio pool y el plan gratuito de Atlas admite un número limitado de conexiones; además, el fallo de conexión llega al log con su motivo real.
- **`GET /health`:** responde siempre igual, sin token y sin tocar la base.
- **CORS restringido** a un único origen (`CLIENT_ORIGIN`, normalizado sin barra final) en lugar de permitir cualquiera.
- **Variables de entorno** para todos los secretos, con `.env.example` en el repositorio y `.env` en `.gitignore`. El `JWT_SECRET` de producción es independiente del de desarrollo.
- **Índice compuesto** `{ owner: 1, createdAt: -1 }` que sirve el filtro y el orden del listado de tarjetas.
- **Front end:** `client/vercel.json` reescribe todas las rutas a `index.html` para que React Router resuelva `/signin` y `/signup` al abrirlas o recargarlas directamente.

## Funcionalidad

- **Registro e inicio de sesión** contra la API propia.
- **Sesión persistente:** el JWT se guarda en `localStorage` y se valida con `GET /users/me` al cargar la página.
- **Cierre de sesión** desde el encabezado, que elimina el token.
- **Rutas protegidas:** `/` solo con sesión; `/signin` y `/signup` solo para visitantes; cualquier otra ruta redirige según el estado de la sesión.
- **Estado de autenticación con tres valores** (`checking`, `authenticated`, `guest`) para no redirigir por error mientras se valida el token.
- **Ventana informativa** (`InfoTooltip`) con el resultado del registro y los errores al iniciar sesión.
- **Perfil:** edición del nombre, la descripción y el avatar.
- **Tarjetas:** listado, creación, "me gusta" y eliminación de las propias.
- **Ventana emergente de imagen** al hacer clic en una tarjeta.

> Nota de diseño: como `GET /cards` devuelve únicamente las tarjetas del usuario autenticado, cada persona ve solo las suyas.

## Tecnologías

**Front end (`client/`)**

- React 19, componentes funcionales y Hooks (`useState`, `useEffect`, `useContext`, `useRef`).
- TypeScript, Vite y React Router (`react-router-dom`).
- Contexto de React (`CurrentUserContext`) y un hook de validación de formularios (`useFormValidation`).
- Peticiones con `fetch` y `async/await`, centralizadas en `utils/api.ts` (recursos) y `utils/auth.ts` (registro e inicio de sesión).
- CSS con metodología BEM y arquitectura por bloques.

**Back end (`server/`)**

- Node.js, Express 5 y TypeScript (ES Modules).
- MongoDB Atlas con Mongoose.
- `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `cors` y `dotenv`.
- ESLint y Prettier.

## Estructura del proyecto

```
web_project_around_full/
├── client/                   # Aplicación de React (Vite)
│   ├── vercel.json           # Reescritura a index.html para el enrutamiento SPA
│   └── src/
│       ├── blocks/           # Estilos por bloque (BEM)
│       ├── components/       # Componentes de React
│       ├── contexts/         # CurrentUserContext
│       ├── hooks/            # useFormValidation
│       ├── types/            # Tipos de TypeScript
│       └── utils/            # api.ts, auth.ts y config.ts
├── server/                   # API de Express
│   └── src/
│       ├── app.ts            # Configuración, conexión a MongoDB y montaje de rutas
│       ├── config.ts         # Lectura y validación de variables de entorno
│       ├── routes/           # Definición de rutas
│       ├── controllers/      # Lógica de cada operación
│       ├── middleware/       # auth, rateLimiters y errorHandler
│       ├── models/           # Esquemas de Mongoose (User, Card)
│       └── utils/            # Listas blancas de respuesta
├── package.json              # Scripts de la raíz
└── README.md
```

## API

Todas las rutas, salvo las tres primeras, exigen `Authorization: Bearer <token>`.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/health` | Pública | Comprobación de estado |
| `POST` | `/signup` | Pública | Crea un usuario (`email`, `password`) |
| `POST` | `/signin` | Pública | Devuelve `{ token, user }` |
| `GET` | `/users` | Token | Lista de usuarios (sin correo) |
| `GET` | `/users/me` | Token | Perfil propio |
| `GET` | `/users/:id` | Token | Perfil de otra persona (sin correo) |
| `PATCH` | `/users/me` | Token | Actualiza nombre y descripción |
| `PATCH` | `/users/me/avatar` | Token | Actualiza el avatar |
| `GET` | `/cards` | Token | Tarjetas del usuario, de la más reciente a la más antigua |
| `POST` | `/cards` | Token | Crea una tarjeta (`name`, `link`) |
| `DELETE` | `/cards/:id` | Token + propietario | Elimina una tarjeta propia |
| `PUT` | `/cards/:id/likes` | Token + propietario | Da "me gusta" |
| `DELETE` | `/cards/:id/likes` | Token + propietario | Quita el "me gusta" |

## Variables de entorno

**Servidor (`server/.env`)**

| Variable | Descripción |
| --- | --- |
| `JWT_SECRET` | Clave para firmar y verificar los tokens. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `MONGODB_URI` | Cadena de conexión de MongoDB (local o Atlas), con el nombre de la base antes del `?` |
| `CLIENT_ORIGIN` | Origen del front end autorizado por CORS, `https://` incluido y sin barra final |
| `PORT` | Puerto del servidor (opcional, por defecto `3001`) |

**Cliente (`client/.env`)**

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL de la API, sin barra final. **No es un secreto:** queda dentro del paquete que descarga el navegador |

> Los archivos `.env` no se suben al repositorio; solo los `.env.example`.

## Ejecución en local

Requisitos: [Node.js](https://nodejs.org/) (LTS) y una base de datos MongoDB (local en el puerto `27017` o una cadena de conexión de Atlas).

1. Clona el repositorio e instala las dependencias de ambas mitades:

```bash
git clone https://github.com/<tu-usuario>/web_project_around_full.git
cd web_project_around_full
npm run install:all
```

2. Crea los archivos de entorno a partir de los ejemplos y completa los valores:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Levanta cada mitad en su propia terminal:

```bash
npm run dev:server   # API en http://localhost:3001
npm run dev:client   # Aplicación en http://localhost:3000
```

4. Abre [http://localhost:3000](http://localhost:3000). Sin sesión, serás redirigido a `/signin`.

Otros scripts útiles:

```bash
npm run build --prefix server   # Compila TypeScript a dist/
npm run start --prefix server   # Ejecuta el servidor compilado
npm run lint --prefix server
npm run build --prefix client   # Construcción de producción del front end
npm run lint --prefix client
```

## Despliegue

El front end y la API se despliegan como **dos proyectos independientes de Vercel** a partir del mismo repositorio, cada uno con su directorio raíz (`client` y `server`).

1. **MongoDB Atlas:** crear el clúster y el usuario de base de datos, y habilitar el acceso de red necesario para las funciones de Vercel.
2. **Proyecto de la API (`server`):** configurar `MONGODB_URI`, `JWT_SECRET` (un secreto **nuevo** para producción) y `CLIENT_ORIGIN` con la URL exacta del front end.
3. **Proyecto del cliente (`client`):** configurar `VITE_API_URL` con la URL de la API.
4. **Verificar:** abrir `/health`, registrar un usuario, iniciar sesión y probar una operación protegida.

Importante: los cambios en variables de entorno solo se aplican con un **nuevo despliegue**, y `VITE_API_URL` se incorpora durante la compilación, por lo que modificarla exige reconstruir el front end.

## Autor

**Rodrigo Maya**
[LinkedIn](https://linkedin.com/in/rod-maya) · rodrigomaya000@gmail.com

Proyecto final - Sprint 16 (Autenticación segura en el back end y despliegue) | TripleTen Bootcamp