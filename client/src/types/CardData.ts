export interface CardData {
  _id: string;
  name: string;
  link: string;
  owner: string;
  createdAt: string;
  isLiked: boolean;
}

// Datos que viajan del formulario "Nueva tarjeta" hacia la API
export interface CardFormData {
  name: string;
  link: string;
}