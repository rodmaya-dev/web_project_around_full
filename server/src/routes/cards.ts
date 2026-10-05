import { Router } from "express";
import { getCards, createCard, deleteCard, likeCard, dislikeCard } from "../controllers/cards.js";

const cardsRouter = Router();

cardsRouter.get("/", getCards);
cardsRouter.post("/", createCard);
cardsRouter.delete("/:id", deleteCard);
cardsRouter.put("/:id/likes", likeCard);
cardsRouter.delete("/:id/likes", dislikeCard);

export default cardsRouter;