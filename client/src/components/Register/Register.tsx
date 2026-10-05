import { useState } from 'react';
import { Link } from 'react-router-dom';

type RegisterProps = {
  handleRegister: (email: string, password: string) => Promise<void>;
};

function Register({ handleRegister }: RegisterProps): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    handleRegister(email, password);
  }

  return (
    <main className="auth">
      <h1 className="auth__title">Regístrate</h1>
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="auth__submit" type="submit">
          Regístrate
        </button>
      </form>
      <Link className="auth__link" to="/signin">
        ¿Ya eres miembro? Inicia sesión aquí
      </Link>
    </main>
  );
}

export default Register;