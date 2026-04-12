import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  ShieldExclamationIcon,
  BeakerIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/grupos', icon: UserGroupIcon, label: 'Mis Grupos' },
  { to: '/transacciones', icon: ArrowsRightLeftIcon, label: 'Transacciones' },
  { to: '/riesgo', icon: ShieldExclamationIcon, label: 'Análisis de Riesgo' },
  { to: '/simulacion', icon: BeakerIcon, label: 'Simulaciones' },
  { to: '/perfil', icon: UserCircleIcon, label: 'Mi Perfil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'FS';

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <ChartBarIcon className="sidebar-logo-icon" />
        </div>
        <div>
          <span className="sidebar-brand-name">FinShare</span>
          <span className="sidebar-brand-sub">Analytics</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Navegación principal">
        <ul className="sidebar-nav-list">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                id={`nav-${to.replace('/', '')}`}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-info">

          </div>
        </div>
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          id="btn-logout"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon className="sidebar-nav-icon" />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
