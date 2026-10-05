import mongoose from "mongoose";
import { validateUrl } from "./urlValidator.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: validateUrl,
      message: "El enlace del avatar no es una URL válida",
    },
  },
});

const User = mongoose.model("User", userSchema);

export default User;