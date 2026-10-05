import { Link, useLocation } from 'react-router-dom';

import logo from '../../images/logo.svg';
import type { AuthStatus } from '../../interfaces/AuthStatus';

type HeaderProps = {
  authStatus: AuthStatus;
  email: string;
  handleSignOut: () => void;
};

function Header({ authStatus, email, handleSignOut }: HeaderProps): React.JSX.Element {
  const { pathname } = useLocation();

  function renderNavigation(): React.JSX.Element | null {
    // Mientras no sabemos si hay sesión no mostramos nada, para evitar parpadeos
    if (authStatus === 'checking') {
      return null;
    }

    if (authStatus === 'authenticated') {
      return (
        <>
          {email && <span className="header__email">{email}</span>}
          <button className="header__logout" type="button" onClick={handleSignOut}>
            Cerrar sesión
          </button>
        </>
      );
    }

    const isSigninPage = pathname === '/signin';

    return (
      <Link className="header__link" to={isSigninPage ? '/signup' : '/signin'}>
        {isSigninPage ? 'Regístrate' : 'Iniciar sesión'}
      </Link>
    );
  }

  return (
    <header className="header page__section">
      <img
        alt="Logotipo Around The U.S."
        className="logo header__logo"
        src={logo}
      />
      <nav className="header__nav">{renderNavigation()}</nav>
    </header>
  );
}

export default Header;