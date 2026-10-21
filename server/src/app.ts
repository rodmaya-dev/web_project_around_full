import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mainRouter from "./routes/index.js";
import { createUser } from "./controllers/users.js";
import { login } from "./controllers/auth.js";
import { auth } from "./middleware/auth.js";
import { signinLimiter, signupLimiter } from "./middleware/rateLimiters.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:3000" }));

mongoose.connect("mongodb://localhost:27017/aroundb") // aroundb es la base de datos que usaremos
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas abiertas: entregan el token, así que van antes de la autenticación.
// Cada una lleva su propio limitador, que se ejecuta antes que el controlador.
app.post("/signup", signupLimiter, createUser);
app.post("/signin", signinLimiter, login);

// Todo lo que se monte desde aquí hacia abajo exige un token válido.
app.use(auth);

app.use(mainRouter);

app.use((_req, res) => {
  res.status(404).send({ message: "Recurso solicitado no encontrado" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});