// Declara las variables de entorno propias para que import.meta.env las tipe.
// Vite solo expone al código las que empiezan por VITE_.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}