import "dotenv/config";

// Falla al arrancar si falta una variable obligatoria: es mejor que descubrirlo
// con la primera petición, y más claro que un "undefined" en medio del código.
const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
};

const DEFAULT_PORT = 3001;
const port = Number(process.env.PORT ?? DEFAULT_PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("La variable de entorno PORT debe ser un número entero positivo");
}

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const MONGODB_URI = requireEnv("MONGODB_URI");
export const PORT = port;

// CORS compara el origen carácter a carácter y el navegador nunca envía la barra
// final, así que "https://app.vercel.app/" jamás coincidiría con "https://app.vercel.app".
export const CLIENT_ORIGIN = requireEnv("CLIENT_ORIGIN").replace(/\/+$/, "");