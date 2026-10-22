import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // El detalle completo se queda en el log del servidor; al cliente solo sale
  // un mensaje pensado para él.
  console.error(err);

  let { statusCode = 500 } = err; // 500 valor por default en caso de que statusCode sea undefined
  let { message } = err;

  if (err instanceof mongoose.Error.CastError) {
    // El mensaje original de Mongoose nombra el modelo y el campo internos.
    statusCode = 400;
    message = "El identificador o el valor enviado no tiene un formato válido";
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Se usan solo los mensajes de cada regla, sin el prefijo "<Modelo> validation failed".
    statusCode = 400;
    message = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join("; ");
  }

  res.status(statusCode).send({
    message: statusCode === 500 ? "Ha ocurrido un error en el servidor" : message,
  });
};