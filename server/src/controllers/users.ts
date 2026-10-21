import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { toOwnUser, toPublicUser } from "../utils/userResponse.js";

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;
const MONGO_DUPLICATE_KEY_CODE = 11000;

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === MONGO_DUPLICATE_KEY_CODE;

// Lista de otras personas: sin correo.
export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.find({});
  res.send(users.map(toPublicUser));
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw Object.assign(new Error("No se encontró ningún usuario con ese id"), {
      statusCode: 404,
    });
  }

  // Si el id pedido es el del propio solicitante, es su perfil y ve su correo.
  // Si req.user no existiera, la comparación da false y se aplica la vista pública.
  const isOwnProfile = user._id.toString() === req.user?._id;

  res.send(isOwnProfile ? toOwnUser(user) : toPublicUser(user));
};

export const createUser = async (req: Request, res: Response) => {
  const { name, about, avatar, email, password } = req.body ?? {};

  // Se valida antes de tocar la base de datos y antes de hashear.
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw Object.assign(new Error("El correo y la contraseña son obligatorios"), {
      statusCode: 400,
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw Object.assign(
      new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`),
      { statusCode: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    res.status(201).send(toOwnUser(user));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw Object.assign(new Error("Ya existe un usuario con ese correo"), {
        statusCode: 409,
      });
    }
    throw error;
  }
};

export const getUserMe = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("No se pudo identificar al usuario"), {
      statusCode: 401,
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(new Error("No se encontró ningún usuario con ese id"), {
      statusCode: 404,
    });
  }

  res.send(toOwnUser(user));
};

// Estas dos rutas actúan siempre sobre /me, con el id que sale del token y sin
// parámetro de id en la URL: nadie puede editar el perfil de otra persona porque
// ni siquiera existe una forma de pedirlo.
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { name, about } = req.body;

  if (!userId) {
    throw Object.assign(new Error("No se pudo identificar al usuario"), {
      statusCode: 401,
    });
  }

  const user = await User.findByIdAndUpdate(
    userId, //  ID
    { name, about }, // cambios
    { new: true, runValidators: true }, // opciones
  );

  if (!user) {
    throw Object.assign(new Error("No se encontró ningún usuario con ese id"), {
      statusCode: 404,
    });
  }

  res.send(toOwnUser(user));
};

export const updateAvatar = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { avatar } = req.body;

  if (!userId) {
    throw Object.assign(new Error("No se pudo identificar al usuario"), {
      statusCode: 401,
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw Object.assign(new Error("No se encontró ningún usuario con ese id"), {
      statusCode: 404,
    });
  }

  res.send(toOwnUser(user));
};