import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

const MINUTE_IN_MS = 60 * 1000;

// Se delega en el errorHandler central para que el 429 salga con el mismo
// formato { message } que el resto de errores.
const tooManyRequests =
  (message: string) => (_req: Request, _res: Response, next: NextFunction) => {
    next(Object.assign(new Error(message), { statusCode: 429 }));
  };

// Frena la adivinanza de contraseñas. Solo cuentan los intentos fallidos
// (skipSuccessfulRequests): quien inicia sesión bien no consume su cupo.
export const signinLimiter = rateLimit({
  windowMs: 15 * MINUTE_IN_MS,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests("Demasiados intentos de inicio de sesión. Inténtalo más tarde"),
});

// Frena el alta masiva de cuentas. Aquí cuenta todo, porque cada registro
// correcto también crea una fila (y gasta un hash bcrypt, que es caro).
export const signupLimiter = rateLimit({
  windowMs: 60 * MINUTE_IN_MS,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests("Demasiados registros desde esta dirección. Inténtalo más tarde"),
});