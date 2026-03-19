import { useState } from 'react';
import Button from '../../components/common/Button';
import '../../assets/styles/Welcome.css';

function Welcome() {
  const [count, setCount] = useState(0);

  return (
    <section className="welcome-section">
      <h1 className="welcome-title">¡Bienvenido a FinShare Analytics!</h1>
      <p className="welcome-description">
        Tu plataforma integral para el análisis financiero inteligente. 
        Explora datos, genera insights y toma decisiones basadas en información precisa.
      </p>
      <div className="welcome-counter-group">
        <Button onClick={() => setCount((count) => count + 1)}>
          Contador interactivo: {count}
        </Button>
      </div>
      <div className="welcome-buttons">
        <a href="/home" style={{ textDecoration: 'none' }}>
          <Button>Ir al Dashboard</Button>
        </a>
        <Button variant="secondary">Explorar Features</Button>
      </div>
    </section>
  );
}

export default Welcome;

