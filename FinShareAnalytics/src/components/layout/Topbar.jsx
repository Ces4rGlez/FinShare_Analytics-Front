import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon } from '@heroicons/react/24/outline';
import './Topbar.css';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/grupos': 'Mis Grupos',
  '/transacciones': 'Transacciones',
  '/riesgo': 'Análisis de Riesgo',
  '/simulacion': 'Simulaciones',
  '/perfil': 'Mi Perfil',
};

export default function Topbar({ onMenuToggle }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || 'FinShare';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <header className="topbar" id="main-topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          id="btn-menu-toggle"
        >
          <Bars3Icon style={{ width: 22, height: 22 }} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          <p className="topbar-greeting">
            {greeting}, <strong>{user?.name?.split(' ')[0] || 'Usuario'}</strong>
          </p>
        </div>
      </div>

      <div className="topbar-right">
        {user?.email && (
          <div className="topbar-user-info">
            <span className="topbar-user-email">{user.email}</span>
          </div>
        )}
        <div className="topbar-avatar">
          {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'FS'}
        </div>
      </div>
    </header>
  );
}
