import { Router } from "express";
import { getUsers, getUserById, createUser, getUserMe, updateProfile, updateAvatar } from "../controllers/users.js";

const usersRouter = Router();

usersRouter.get("/", getUsers);
usersRouter.get("/me", getUserMe);
usersRouter.patch("/me", updateProfile);
usersRouter.patch("/me/avatar", updateAvatar);
usersRouter.get("/:id", getUserById);
usersRouter.post("/", createUser);

export default usersRouter;