// server/src/app.ts

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mainRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:3000" }));

mongoose.connect("mongodb://localhost:27017/aroundb") // aroundb es la base de datos que usaremos
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: "6aa5e8a445520fdee610bc43",
  };
  next();
});

app.use(mainRouter);

app.use((_req, res) => {
  res.status(404).send({ message: "Recurso solicitado no encontrado" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});