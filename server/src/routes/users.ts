import { Router } from "express";
import { getUsers, getUserById, getUserMe, updateProfile, updateAvatar } from "../controllers/users.js";

const usersRouter = Router();

usersRouter.get("/", getUsers);
usersRouter.get("/me", getUserMe);
usersRouter.patch("/me", updateProfile);
usersRouter.patch("/me/avatar", updateAvatar);
usersRouter.get("/:id", getUserById);

export default usersRouter;