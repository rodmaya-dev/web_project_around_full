import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { JWT_SECRET } from "../config.js";
import { toOwnUser } from "../utils/userResponse.js";

const TOKEN_EXPIRATION = "7d";

// Con el mismo coste que SALT_ROUNDS de users.ts. Sirve para que "correo
// inexistente" tarde lo mismo que "contraseña incorrecta" (ver login).
const DUMMY_HASH = bcrypt.hashSync("contraseña-de-relleno", 10);

const invalidCredentials = () =>
  Object.assign(new Error("Correo o contraseña incorrectos"), {
    statusCode: 401,
  });

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw Object.assign(new Error("El correo y la contraseña son obligatorios"), {
      statusCode: 400,
    });
  }

  // password tiene select:false en el esquema, así que se pide de forma explícita.
  const user = await User.findOne({ email }).select("+password");

  // Se compara siempre, exista o no el usuario, para no revelar por tiempo de
  // respuesta qué correos están registrados.
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    throw invalidCredentials();
  }

  const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  res.send({ token, user: toOwnUser(user) });
};