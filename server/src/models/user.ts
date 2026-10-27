import mongoose from "mongoose";
import { validateUrl } from "./urlValidator.js";

// Valores por defecto: el registro solo envía email y password.
const DEFAULT_NAME = "Jacques Cousteau";
const DEFAULT_ABOUT = "Explorador";
const DEFAULT_AVATAR = "https://practicum-content.s3.us-west-1.amazonaws.com/web-lat/avatar.jpg";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: 2,
    maxlength: 30,
    default: DEFAULT_NAME,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: DEFAULT_ABOUT,
  },
  avatar: {
    type: String,
    required: true,
    default: DEFAULT_AVATAR,
    validate: {
      validator: validateUrl,
      message: "El enlace del avatar no es una URL válida",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "El email no es válido"],   
  },
  password: {
    type: String,
    required: true,
    // Oculta el hash en cualquier consulta; login lo pedirá con .select("+password").
    select: false,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;