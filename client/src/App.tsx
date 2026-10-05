// client/src/App.tsx

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import api from './utils/api';
import CurrentUserContext from './contexts/CurrentUserContext';

import type { UserData, ProfileFormData } from './interfaces/UserData';
import type { CardData, CardFormData } from './interfaces/CardData';
import type { ModalData } from './interfaces/ModalData';
import type { AuthStatus } from './interfaces/AuthStatus';

function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [popup, setPopup] = useState<ModalData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  // Se ejecuta una sola vez al montar: decide si hay sesión.
  // Paso 5/6: aquí se validará el token contra /users/me de la API de autenticación.
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('jwt');
      setAuthStatus(token ? 'authenticated' : 'guest');
    })();
  }, []);

  // Los datos de la API propia solo se piden cuando hay sesión
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

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
  }, [authStatus]);

  function handleOpenPopup(popup: ModalData) {
    setPopup(popup);
  }

  function handleClosePopup() {
    setPopup(null);
  }

  async function handleCardLike(card: CardData): Promise<void> {
    try {
      const updatedCard = await api.changeLikeStatus(card._id, card.isLiked);
      setCards((state) => state.map((c) => (c._id === card._id ? updatedCard : c)));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCardDelete(card: CardData): Promise<void> {
    try {
      await api.deleteCard(card._id);
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

  // /signin y /signup no van envueltas en ProtectedRoute (lo pide la lista):
  // aquí se resuelve el caso inverso, un usuario con sesión no debe verlas.
  function renderGuestPage(page: React.JSX.Element): React.JSX.Element | null {
    if (authStatus === 'checking') {
      return null;
    }

    if (authStatus === 'authenticated') {
      return <Navigate to="/" replace />;
    }

    return page;
  }

  return (
    <CurrentUserContext.Provider value={{ currentUser, handleUpdateUser, handleUpdateAvatar, handleAddPlaceSubmit }}>
      <div className='page__content'>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute authStatus={authStatus}>
                <Main
                  cards={cards}
                  popup={popup}
                  handleOpenPopup={handleOpenPopup}
                  handleClosePopup={handleClosePopup}
                  handleCardLike={handleCardLike}
                  handleCardDelete={handleCardDelete}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={renderGuestPage(<Login />)} />
          <Route path="/signup" element={renderGuestPage(<Register />)} />
          {/* Cualquier otra ruta cae en "/", que a su vez protege según la sesión */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;