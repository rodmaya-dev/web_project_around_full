import dns from 'node:dns';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mainRouter from "./routes/index.js";
import { createUser } from "./controllers/users.js";
import { login } from "./controllers/auth.js";
import { auth } from "./middleware/auth.js";
import { signinLimiter, signupLimiter } from "./middleware/rateLimiters.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { CLIENT_ORIGIN, MONGODB_URI, PORT } from "./config.js";

// Solo en desarrollo: el resolver de algunas redes domésticas rechaza consultas SRV.
// En Vercel se usa el DNS de la plataforma.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

// Tope de conexiones abiertas por instancia. Cada instancia de la plataforma abre
// su propio grupo, y el plan gratuito de Atlas admite un número limitado en total.
const MONGO_MAX_POOL_SIZE = 10;

const app = express();

// Detrás del proxy de la plataforma, req.ip sería la IP del proxy y todos los
// visitantes compartirían el mismo cupo de los limitadores. El 1 indica que se
// confía en un único salto (el proxy de la plataforma).
app.set("trust proxy", 1);

app.use(cors({ origin: CLIENT_ORIGIN }));

mongoose.connect(MONGODB_URI, { maxPoolSize: MONGO_MAX_POOL_SIZE })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprobación de estado para la plataforma y para monitores externos. Responde
// siempre lo mismo a propósito: no toca la base y no pide token, así que solo dice
// "el proceso está vivo" y no filtra nada del estado interno.
app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

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
  console.log(`Server is running on port ${PORT}`);
});