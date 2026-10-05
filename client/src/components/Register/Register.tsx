// client/src/components/Register/Register.tsx

import { Link } from 'react-router-dom';

function Register(): React.JSX.Element {
  return (
    <main className="auth">
      <h2 className="auth__title">Regístrate</h2>
      <Link to="/signin">¿Ya eres miembro? Inicia sesión aquí</Link>
    </main>
  );
}

export default Register;