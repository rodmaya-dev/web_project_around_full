import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Header from './Header/Header';
import Main from './Main/Main';
import Footer from './Footer/Footer';
import Login from './Login/Login';
import Register from './Register/Register';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import InfoTooltip from './InfoTooltip/InfoTooltip';

import api from '../utils/api';
import { TOKEN_KEY, login, register } from '../utils/auth';
import CurrentUserContext from '../contexts/CurrentUserContext';

import type { UserData, ProfileFormData } from '../types/UserData';
import type { CardData, CardFormData } from '../types/CardData';
import type { ModalData } from '../types/ModalData';
import type { AuthStatus } from '../types/AuthStatus';
import type { InfoTooltipStatus } from '../types/InfoTooltipStatus';

function App() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [popup, setPopup] = useState<ModalData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() =>
    localStorage.getItem(TOKEN_KEY) ? 'checking' : 'guest'
  );
  const [infoTooltipStatus, setInfoTooltipStatus] = useState<InfoTooltipStatus | null>(null);

  // Restaura la sesión si hay un token guardado. El estado inicial ya es 'checking'
  // en ese caso, así que ProtectedRoute espera la respuesta de /users/me sin redirigir.
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      validateSession();
    }
  }, []);

  // Las tarjetas se piden una sola vez por sesión, cuando authStatus pasa a
  // 'authenticated'. El perfil ya lo trajo validateSession.
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

    (async () => {
      try {
        setCards(await api.getInitialCards());
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

  // GET /users/me valida el token y trae el perfil completo en una sola petición.
  // Si el token no sirve, se borra: así nunca queda guardado un token inválido.
  async function validateSession(): Promise<boolean> {
    try {
      const user = await api.getUserInfo();
      setCurrentUser(user);
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
      await register(email, password);
      setInfoTooltipStatus('success');
      navigate('/signin');
    } catch (error) {
      console.error(error);
      setInfoTooltipStatus('error');
    }
  }

  async function handleLogin(email: string, password: string): Promise<void> {
    try {
      const token = await login(email, password);
      localStorage.setItem(TOKEN_KEY, token);

      const isSessionValid = await validateSession();
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

  // /signin y /signup no van envueltas en ProtectedRoute:
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
          email={currentUser?.email ?? ''}
          handleSignOut={handleSignOut}
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute authStatus={authStatus}>
                {currentUser ? (
                  <Main
                    cards={cards}
                    popup={popup}
                    handleOpenPopup={handleOpenPopup}
                    handleClosePopup={handleClosePopup}
                    handleCardLike={handleCardLike}
                    handleCardDelete={handleCardDelete}
                  />
                ) : null}
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