import { useState } from 'react';
import { Link } from 'react-router-dom';

type LoginProps = {
  handleLogin: (email: string, password: string) => Promise<void>;
};

function Login({ handleLogin }: LoginProps): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    handleLogin(email, password);
  }

  return (
    <main className="auth">
      <h1 className="auth__title">Inicia sesión</h1>
      <form className="auth__form" onSubmit={handleSubmit}>
        <input
          className="auth__input"
          type="email"
          name="email"
          placeholder="Correo electrónico"
          aria-label="Correo electrónico"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="auth__input"
          type="password"
          name="password"
          placeholder="Contraseña"
          aria-label="Contraseña"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="auth__submit" type="submit">
          Inicia sesión
        </button>
      </form>
      <Link className="auth__link" to="/signup">
        ¿Aún no eres miembro? Regístrate aquí
      </Link>
    </main>
  );
}

export default Login;