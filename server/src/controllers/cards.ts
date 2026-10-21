import type { Request, Response } from "express";
import Card from "../models/card.js";

// Tipo del documento hidratado de Mongoose (el que tiene toObject, deleteOne, etc.).
type CardDocument = InstanceType<typeof Card>;

// El middleware de autenticación (middleware/auth.ts) siempre rellena req.user,
// pero su tipo es opcional. Esta función lo estrecha a string en un solo lugar
// y falla con 401 si por algún error de montaje de rutas llegara vacío.
const getRequesterId = (req: Request): string => {
  const userId = req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("No se pudo identificar al usuario"), {
      statusCode: 401,
    });
  }

  return userId;
};

// Con los tipos de Express 5 y noUncheckedIndexedAccess, req.params.id es
// string | string[] | undefined. Validarlo aquí evita un "as string" que
// apagaría el chequeo de tipos.
const getCardId = (req: Request): string => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw Object.assign(new Error("El id de la tarjeta no es válido"), {
      statusCode: 400,
    });
  }

  return id;
};

const cardNotFound = () =>
  Object.assign(new Error("No se encontró ninguna tarjeta con ese id"), {
    statusCode: 404,
  });

// isLiked no se guarda en la base de datos: depende de quién pregunta, así que
// se calcula en cada respuesta. El cliente lo usa para pintar el corazón.
const withIsLiked = (card: CardDocument, userId: string) => ({
  ...card.toObject(),
  isLiked: card.likes.some((id) => id.toString() === userId),
});

// Única puerta de acceso a una tarjeta ajena: la usan borrar, like y dislike,
// así la regla de autorización vive en un solo sitio.
// Primero existencia (404) y después propiedad (403): responder 403 a un id
// inexistente confirmaría que esa tarjeta existe.
const findOwnedCard = async (cardId: string, userId: string): Promise<CardDocument> => {
  const card = await Card.findById(cardId);

  if (!card) {
    throw cardNotFound();
  }

  if (card.owner.toString() !== userId) {
    throw Object.assign(new Error("No tienes permiso para realizar esta acción sobre la tarjeta"), {
      statusCode: 403,
    });
  }

  return card;
};

// Filtrar (qué ves) y comprobar (qué puedes hacer) son capas distintas: aquí solo
// se filtra. Un id ajeno puede llegar sin haber pasado por esta lista, por eso
// las operaciones de abajo comprueban la propiedad por su cuenta.
// El índice { owner: 1, createdAt: -1 } de models/card.ts sirve este filtro y orden.
export const getCards = async (req: Request, res: Response) => {
  const userId = getRequesterId(req);

  const cards = await Card.find({ owner: userId }).sort({ createdAt: -1 });

  res.send(cards.map((card) => withIsLiked(card, userId)));
};

// El dueño sale siempre del token, nunca del cuerpo de la petición: si lo
// aceptáramos del body, cualquiera podría crear tarjetas a nombre de otra persona.
export const createCard = async (req: Request, res: Response) => {
  const { name, link } = req.body;
  const userId = getRequesterId(req);

  const card = await Card.create({ name, link, owner: userId });

  res.status(201).send(withIsLiked(card, userId));
};

export const deleteCard = async (req: Request, res: Response) => {
  const card = await findOwnedCard(getCardId(req), getRequesterId(req));

  await card.deleteOne();

  res.send(card);
};

// El enunciado exige ser dueño también para dar "me gusta", coherente con que
// GET /cards solo devuelve las tarjetas propias.
export const likeCard = async (req: Request, res: Response) => {
  const userId = getRequesterId(req);
  const cardId = getCardId(req);

  await findOwnedCard(cardId, userId);

  // Se usa $addToSet (atómico y sin duplicados) en lugar de modificar el array
  // en memoria: en este esquema card.likes se tipa como ObjectId[] plano y no
  // tiene addToSet/pull de Mongoose.
  // El owner en el filtro mantiene la regla también en la propia escritura, por
  // si la tarjeta cambiara de dueño entre la comprobación y el update.
  const card = await Card.findOneAndUpdate(
    { _id: cardId, owner: userId },
    { $addToSet: { likes: userId } },
    { new: true },
  );

  // Solo ocurre si la tarjeta se borró justo entre la comprobación y el update.
  if (!card) {
    throw cardNotFound();
  }

  res.send(withIsLiked(card, userId));
};

// Mismo patrón que likeCard, con $pull para quitar el id del array.
export const dislikeCard = async (req: Request, res: Response) => {
  const userId = getRequesterId(req);
  const cardId = getCardId(req);

  await findOwnedCard(cardId, userId);

  const card = await Card.findOneAndUpdate(
    { _id: cardId, owner: userId },
    { $pull: { likes: userId } },
    { new: true },
  );

  if (!card) {
    throw cardNotFound();
  }

  res.send(withIsLiked(card, userId));
};