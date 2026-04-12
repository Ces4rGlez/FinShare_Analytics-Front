import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login         from '../pages/Login/Login.jsx';
import Dashboard     from '../pages/Dashboard/Dashboard.jsx';
import Groups        from '../pages/Groups/Groups.jsx';
import DetalleGrupo  from '../pages/Groups/DetalleGrupo.jsx';
import Transactions  from '../pages/Transactions/Transactions.jsx';
import Risk          from '../pages/Risk/Risk.jsx';
import Simulation    from '../pages/Simulation/Simulation.jsx';
import SimulationHistory from '../pages/Simulation/SimulationHistory.jsx';
import Profile       from '../pages/Profile/Profile.jsx';
import Welcome       from '../pages/Welcome/Welcome.jsx';

// ── Protected Route Guard ──────────────────────────────────────
function Protected({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
        }}>
          <div style={{
            width: 48, height: 48,
            border: '3px solid var(--color-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}

// ── Router ─────────────────────────────────────────────────────
const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/"        element={<Welcome />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/home"    element={<Navigate to="/grupos" replace />} />

      {/* Protected */}
      <Route path="/dashboard"     element={<Protected><Dashboard /></Protected>} />
      <Route path="/grupos"        element={<Protected><Groups /></Protected>} />
      <Route path="/grupo/:id"     element={<Protected><DetalleGrupo /></Protected>} />
      <Route path="/transacciones" element={<Protected><Transactions /></Protected>} />
      <Route path="/riesgo"        element={<Protected><Risk /></Protected>} />
      <Route path="/simulacion"    element={<Protected><Simulation /></Protected>} />
      <Route path="/simulacion/historial" element={<Protected><SimulationHistory /></Protected>} />
      <Route path="/perfil"        element={<Protected><Profile /></Protected>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
