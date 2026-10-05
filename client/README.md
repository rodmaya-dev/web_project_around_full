# Around The U.S. - Gestión de rutas y estado con React

Aplicación frontend desarrollada con **React + TypeScript**, evolución del proyecto del Sprint 11. En este sprint la aplicación pasa de manejar datos estáticos a consumir una API REST real, gestionar estado global mediante Context API y manejar formularios controlados y no controlados.

**Proyecto final del Sprint 12 - TripleTen Bootcamp**

---

## 🚀 Funcionalidad

- Conexión a una API REST para obtener y persistir datos del usuario y las tarjetas
- Estado global compartido mediante Context API (`CurrentUserContext`)
- Elevación del estado (`currentUser`, `cards`, `popup`) al componente raíz `App`
- Dar like / quitar like a una tarjeta, sincronizado con el servidor
- Eliminar tarjetas propias (el botón solo aparece si la tarjeta pertenece al usuario actual)
- Edición de perfil (nombre y descripción) mediante un formulario controlado
- Edición de avatar mediante un formulario no controlado (`useRef`)
- Creación de nuevas tarjetas mediante un formulario controlado
- Apertura y cierre de ventanas emergentes (Popups) mediante estado
- Popup reutilizable para: editar perfil, editar avatar, crear nueva tarjeta, visualizar imágenes
- Componentización de la interfaz en elementos reutilizables
- Renderizado dinámico de tarjetas mediante `map()`

---

## 🛠️ Tecnologías y Técnicas Utilizadas

- **React 19**
- **TypeScript** (modo estricto, `verbatimModuleSyntax`)
- **Vite**
- **HTML5**
- **CSS3**
- **Metodología BEM**
- Fetch API / clase `Api` propia para consumo de REST
- Variables de entorno (`.env`) para credenciales de la API
- Componentes funcionales
- Hooks de React:
  - `useState`
  - `useEffect`
  - `useContext`
  - `useRef`
- Context API
- JSX / TSX
- Props tipadas con interfaces
- Componentes controlados y no controlados
- Renderizado condicional
- Renderizado de listas mediante `map()`
- Desestructuración de objetos y props
- Arquitectura basada en composición

---

## 📂 Estructura del Proyecto

```text
web_project_around_react/
│
├── public/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── assets/
│   ├── blocks/
│   ├── images/
│   │
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx
│   │   ├── Footer/
│   │   │   └── Footer.tsx
│   │   └── Main/
│   │       ├── Main.tsx
│   │       └── components/
│   │           ├── Card/
│   │           │   └── Card.tsx
│   │           └── Popup/
│   │               ├── Popup.tsx
│   │               ├── EditProfile/
│   │               │   └── EditProfile.tsx
│   │               ├── EditAvatar/
│   │               │   └── EditAvatar.tsx
│   │               ├── NewCard/
│   │               │   └── NewCard.tsx
│   │               └── ImagePopup/
│   │                   └── ImagePopup.tsx
│   │
│   ├── contexts/
│   │   └── CurrentUserContext.tsx
│   │
│   ├── interfaces/
│   │   ├── UserData.ts
│   │   ├── CardData.ts
│   │   ├── ModalData.ts
│   │   └── CurrentUserContextType.ts
│   │
│   └── utils/
│       └── api.ts
│
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧠 Conceptos Aplicados

- Consumo de API REST con manejo de errores centralizado
- Context API para evitar _prop drilling_
- Elevación del estado (_Lifting State Up_)
- Sincronización del estado local con el servidor tras cada mutación (like, borrado, edición, creación)
- Componentes controlados (`EditProfile`, `NewCard`) vs. no controlados (`EditAvatar`)
- Efectos secundarios con `useEffect` (fetch inicial en montaje)
- Tipado estricto con interfaces por dominio
- Separación de responsabilidades: `App` concentra las solicitudes a la API y los manejadores de eventos que no son de envío de formulario; los componentes de Popup solo manejan su propio `onSubmit`
- Organización modular del proyecto

---

## ▶️ Cómo ejecutar el proyecto

1. Clona el repositorio.

2. Instala las dependencias.

```bash
npm install
```

3. Crea tu archivo de variables de entorno a partir del ejemplo incluido.

```bash
cp .env.example .env
```

Y completa tus credenciales dentro de `.env`:

VITE_API_BASE_URL=tu-url-base-de-la-api
VITE_API_TOKEN=tu-token

4. Inicia el servidor de desarrollo.

```bash
npm run dev
```

5. Abre el navegador en la dirección mostrada por Vite:

http://localhost:3000

---

## 📚 Aprendizajes del Sprint

Durante este Sprint la aplicación pasó de trabajar con datos estáticos a integrarse con una API REST real, gestionando el estado de forma centralizada.

Los principales objetivos fueron:

- Conectar la aplicación a una API mediante `fetch` y tipar sus respuestas con TypeScript.
- Implementar Context API para compartir datos del usuario sin pasar props manualmente por cada nivel.
- Elevar el estado al componente raíz (`App`) para centralizar la lógica de negocio.
- Diferenciar componentes controlados de no controlados y decidir cuándo usar cada uno.
- Sincronizar el estado local con el servidor tras cada acción del usuario (like, borrado, edición, creación).
- Aplicar buenas prácticas de organización de tipos y manejo de variables de entorno.

---

## 👨‍💻 Autor

**Rodrigo Maya**

Proyecto final - Sprint 12 (React + TypeScript) | TripleTen Bootcamp
