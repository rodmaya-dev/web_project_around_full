import type { Request, Response } from "express";
import User from "../models/user.js";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.find({});
  res.send(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw Object.assign(new Error("No se encontró ningún usuario con ese id"), {
      statusCode: 404,
    });
  }

  res.send(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, about, avatar } = req.body;
  const user = await User.create({ name, about, avatar });
  res.status(201).send(user);
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

  res.send(user);
};

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

  res.send(user);

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

  res.send(user);
};