export interface UserData {
  _id: string;
  name: string;
  about: string;
  avatar: string;
}

// Datos que viajan del formulario "Editar perfil" hacia la API
export interface ProfileFormData {
  name: string;
  about: string;
}