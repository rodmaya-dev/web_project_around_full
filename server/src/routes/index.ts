import { Router } from "express";
import usersRouter from "./users.js";
import cardsRouter from "./cards.js";

const mainRouter = Router();

mainRouter.use("/users", usersRouter);
mainRouter.use("/cards", cardsRouter);

export default mainRouter;