// client/src/App.tsx

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import InfoTooltip from './components/InfoTooltip/InfoTooltip';

import api from './utils/api';
import * as auth from './utils/auth';
import CurrentUserContext from './contexts/CurrentUserContext';

import type { UserData, ProfileFormData } from './interfaces/UserData';
import type { CardData, CardFormData } from './interfaces/CardData';
import type { ModalData } from './interfaces/ModalData';
import type { AuthStatus } from './interfaces/AuthStatus';
import type { InfoTooltipStatus } from './interfaces/InfoTooltipStatus';

const TOKEN_KEY = 'jwt';

function App() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [popup, setPopup] = useState<ModalData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [userEmail, setUserEmail] = useState<string>('');
  const [infoTooltipStatus, setInfoTooltipStatus] = useState<InfoTooltipStatus | null>(null);

  // Se ejecuta una sola vez al montar: decide si hay sesión.
  // TEMPORAL (Paso 6): aquí se usará validateSession para comprobar el token guardado.
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem(TOKEN_KEY);
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

  function handleCloseInfoTooltip(): void {
    setInfoTooltipStatus(null);
  }

  // Comprueba el token con la API de autenticación y actualiza el estado de sesión.
  // Si el token no sirve, lo borra: así nunca queda guardado un token inválido.
  async function validateSession(token: string): Promise<boolean> {
    try {
      const user = await auth.checkToken(token);
      setUserEmail(user.email);
      setAuthStatus('authenticated');
      return true;
    } catch (error) {
      console.error(error);
      localStorage.removeItem(TOKEN_KEY);
      setAuthStatus('guest');
      return false;
    }
  }

  async function handleRegister(email: string, password: string): Promise<void> {
    try {
      await auth.register(email, password);
      setInfoTooltipStatus('success');
      navigate('/signin');
    } catch (error) {
      console.error(error);
      setInfoTooltipStatus('error');
    }
  }

  async function handleLogin(email: string, password: string): Promise<void> {
    try {
      const token = await auth.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);

      const isSessionValid = await validateSession(token);
      if (isSessionValid) {
        navigate('/');
      } else {
        setInfoTooltipStatus('error');
      }
    } catch (error) {
      console.error(error);
      setInfoTooltipStatus('error');
    }
  }

  function handleSignOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    setPopup(null);
    setCurrentUser(null);
    setCards([]);
    setUserEmail('');
    setAuthStatus('guest');
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
        <Header
          authStatus={authStatus}
          email={userEmail}
          handleSignOut={handleSignOut}
        />
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
          <Route path="/signin" element={renderGuestPage(<Login handleLogin={handleLogin} />)} />
          <Route path="/signup" element={renderGuestPage(<Register handleRegister={handleRegister} />)} />
          {/* Cualquier otra ruta cae en "/", que a su vez protege según la sesión */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <InfoTooltip status={infoTooltipStatus} onClose={handleCloseInfoTooltip} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;