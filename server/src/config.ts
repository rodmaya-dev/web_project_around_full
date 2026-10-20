import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;

// Fallar al arrancar es mejor que firmar tokens con un secreto vacío.
if (!jwtSecret) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

export const JWT_SECRET: string = jwtSecret;