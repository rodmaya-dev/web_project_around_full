import { useEffect, useState } from 'react';

import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Footer from './components/Footer/Footer';

import api from './utils/api'
import CurrentUserContext from './contexts/CurrentUserContext';

import type { UserData, ProfileFormData } from './interfaces/UserData';
import type { CardData, CardFormData } from './interfaces/CardData';
import type { ModalData } from "./interfaces/ModalData";

function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [popup, setPopup] = useState<ModalData | null>(null);

  // useEffect con un arreglo vacío [] se ejecuta UNA SOLA VEZ al cargar la página
  useEffect(() => {
    (async () => {
      try {
        const [userData, initialCards] = await Promise.all([
          api.getUserInfo(),
          api.getInitialCards()
        ]);
        setCurrentUser(userData);
        setCards(initialCards);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);
  
  function handleOpenPopup(popup: ModalData) {
    setPopup(popup);
  }

  function handleClosePopup() {
    setPopup(null);
  }

  async function handleCardLike(card: CardData): Promise<void> {
    try {
      // changeLikeStatus decide PUT o DELETE según el estado actual del like
      const updatedCard = await api.changeLikeStatus(card._id, card.isLiked);
      // Reemplazamos solo la tarjeta que cambió; el resto del array se mantiene igual
      setCards((state) => state.map((c) => (c._id === card._id ? updatedCard : c)));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCardDelete(card: CardData): Promise<void> {
    try {
      await api.deleteCard(card._id);
      // Quitamos la tarjeta borrada del estado local sin volver a pedir todo el array
      setCards((state) => state.filter((c) => c._id !== card._id));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateUser(data: ProfileFormData): Promise<void> {
    try {
      const updatedUser = await api.updateUserInfo(data);
      setCurrentUser(updatedUser);
      setPopup(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdateAvatar(avatarUrl: string): Promise<void> {
    try {
      const updatedUser = await api.updateAvatar(avatarUrl);
      setCurrentUser(updatedUser);
      setPopup(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddPlaceSubmit(data: CardFormData): Promise<void> {
    try {
      const newCard = await api.addCard(data);
      setCards((state) => [newCard, ...state]);
      setPopup(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    // Proveemos los datos a toda la aplicación
    <CurrentUserContext.Provider value={{ currentUser, handleUpdateUser, handleUpdateAvatar, handleAddPlaceSubmit }}>
      <div className='page__content'>
        <Header />
        <Main
          cards={cards}
          popup={popup}
          handleOpenPopup={handleOpenPopup}
          handleClosePopup={handleClosePopup}
          handleCardLike={handleCardLike}
          handleCardDelete={handleCardDelete}
        />
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App
