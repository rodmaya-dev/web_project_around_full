const DEFAULT_API_URL = 'http://localhost:3001';

// Vite sustituye este valor por el literal al construir el proyecto: cambiar la
// variable en la plataforma obliga a volver a desplegar el front end.
// Se quita la barra final para no acabar con "//users/me" al concatenar rutas.
export const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');