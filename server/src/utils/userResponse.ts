import type User from "../models/user.js";

type UserDocument = InstanceType<typeof User>;

// Lista blanca de campos: lo que no está aquí nunca sale en una respuesta
// (el hash de la contraseña, __v, las fechas...).

// Lo que puede ver cualquier persona con sesión sobre otra.
export const toPublicUser = (user: UserDocument) => ({
  _id: user._id,
  name: user.name,
  about: user.about,
  avatar: user.avatar,
});

// Solo para su dueño: añade el correo, que nadie más debe ver.
export const toOwnUser = (user: UserDocument) => ({
  ...toPublicUser(user),
  email: user.email,
});