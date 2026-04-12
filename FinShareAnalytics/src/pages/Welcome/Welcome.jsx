import ReactIcon from '../../assets/images/ReactIcon.png';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  // Si el usuario ya tiene sesión, el botón principal lo lleva directo al home
  const token = localStorage.getItem('token');

  return (
    <section className="welcome-section">
      <div className="welcome-hero">
        <img src={ReactIcon} alt="FinShare Logo" className="welcome-logo" />
      </div>

      <h1 className="welcome-title">¡Bienvenido a FinShare Analytics!</h1>
      <p className="welcome-description">
        Tu plataforma integral para el análisis financiero inteligente.
        Explora datos, genera insights y toma decisiones basadas en información precisa.
      </p>

      <div className="welcome-buttons">
        {token ? (
          // Ya tiene sesión → ir directo al dashboard
          <Button onClick={() => navigate('/home')}>
            Ir al Dashboard
          </Button>
        ) : (
          // Sin sesión → mostrar Login y Registro
          <>
            <Button onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
            <Button variant="secondary" onClick={() => navigate('/register')}>
              Crear Cuenta
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

export default Welcome;