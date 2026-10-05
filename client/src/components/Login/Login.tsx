// client/src/components/Login/Login.tsx

import { Link } from 'react-router-dom';

function Login(): React.JSX.Element {
  return (
    <main className="auth">
      <h2 className="auth__title">Iniciar sesión</h2>
      <Link to="/signup">¿Aún no eres miembro? Regístrate aquí</Link>
    </main>
  );
}

export default Login;