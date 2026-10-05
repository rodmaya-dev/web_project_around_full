//Header.tsx

import logo from '../../images/logo.svg';

function Header (): React.JSX.Element {
    return (
    <header className="header page__section">
        <img
          alt="Logotipo Around The U.S."
          className="logo header__logo"
          src={logo}
        />
    </header>
    )
}

export default Header;