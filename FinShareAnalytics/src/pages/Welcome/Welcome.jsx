import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import './Welcome.css';

const CAROUSEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    caption: "Analiza y optimiza tus finanzas personales"
  },
  {
    url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
    caption: "Construye metas junto a tus Roomies o Familia"
  },
  {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    caption: "Simula escenarios y mitiga riesgos a futuro"
  }
];

export default function Welcome() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="welcome-page">
      {/* Navbar Overlay */}
      <nav className="welcome-nav animate-fade-in">
        <div className="nav-container">
          <div className="nav-logo">
            <ChartBarIcon className="nav-logo-icon" />
            <span className="nav-logo-text">FinShare</span>
          </div>
          <Link to="/login">
            <Button variant="secondary" size="sm" icon={ArrowRightIcon}>
              Iniciar Sesión o Registrarse
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Fullscreen Carousel Background */}
      <header className="welcome-hero-section">
        {/* Background Carousel */}
        <div className="hero-bg-carousel">
          <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {CAROUSEL_IMAGES.map((img, idx) => (
              <div key={idx} className="carousel-slide">
                <img src={img.url} alt={`Fondo ${idx + 1}`} className="carousel-image" />
                <div className="carousel-overlay"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content-wrapper">
          <div className="hero-content animate-fade-in">
            <h1 className="hero-title">
              Toma el control de tus <span className="highlight">finanzas compartidas</span>
            </h1>
            <p className="hero-subtitle">
              La plataforma inteligente para gestionar gastos en grupo, analizar riesgos de insolvencia y proyectar tu estabilidad financiera con IA.
            </p>
            <div className="hero-actions">
              <Link to="/login">
                <Button size="lg" icon={SparklesIcon}>Empezar Gratis</Button>
              </Link>
              <a href="#features" className="btn-secondary-link">
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="hero-visual animate-scale-in">
            <ChartBarIcon className="visual-icon" />
            <h2 className="visual-logo-text">FinShare Analytics</h2>
          </div>
        </div>

        {/* Carousel Indicators placed at the bottom of hero */}
        <div className="carousel-indicators">
          {CAROUSEL_IMAGES.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="welcome-features">
        <div className="section-header">
          <h2 className="section-title">Finanzas más inteligentes, juntas.</h2>
          <p className="section-desc">Diseñado para personas que viven juntas, viajan juntas o simplemente quieren un mejor futuro financiero.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon-box f-emerald">
              <UserGroupIcon />
            </div>
            <h3>Gestión de Grupos</h3>
            <p>Divide rentas, servicios y viajes sin complicaciones. FinShare lleva la cuenta por ti.</p>
          </div>

          <div className="feature-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon-box f-rose">
              <ShieldCheckIcon />
            </div>
            <h3>Análisis de Riesgo</h3>
            <p>Monitoreamos tu nivel de deuda y capacidad de ahorro para alertarte antes de cualquier crisis.</p>
          </div>

          <div className="feature-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon-box f-amber">
              <SparklesIcon />
            </div>
            <h3>Proyecciones con IA</h3>
            <p>Simula escenarios como pérdida de empleo o aumento de renta y ve cómo impacta tu futuro.</p>
          </div>

          <div className="feature-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon-box f-blue">
              <ChartBarIcon />
            </div>
            <h3>Informes de Salud</h3>
            <p>Visualizaciones avanzadas de tu patrimonio y el de tus grupos para una transparencia total.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <ChartBarIcon style={{ width: 24 }} />
            <span>FinShare Analytics © 2026</span>
          </div>
          <div className="footer-links">
            <span>UTNG</span>
            <span>Desarrollo Web Profesional</span>
            <span>Los Mosaicos 100</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

