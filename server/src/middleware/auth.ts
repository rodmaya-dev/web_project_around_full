import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const BEARER_PREFIX = "Bearer ";

const unauthorized = (message: string) =>
  Object.assign(new Error(message), { statusCode: 401 });

export const auth = (req: Request, _res: Response, next: NextFunction): void => {
  const { authorization } = req.headers;

  if (!authorization?.startsWith(BEARER_PREFIX)) {
    throw unauthorized("Se requiere autorización");
  }

  const token = authorization.slice(BEARER_PREFIX.length);

  let payload: string | jwt.JwtPayload;
  try {
    // verify lanza si el token está mal formado, la firma no coincide o expiró.
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw unauthorized("Token inválido o expirado");
  }

  if (typeof payload === "string" || typeof payload._id !== "string") {
    throw unauthorized("Token inválido o expirado");
  }

  req.user = { _id: payload._id };
  next();
};