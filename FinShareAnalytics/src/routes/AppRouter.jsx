import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas existentes
import Welcome      from '../pages/Welcome/Welcome.jsx';
import Home         from '../pages/Home/Home.jsx';
import DetalleGrupo from '../pages/Groups/DetalleGrupo.jsx';

// Nuevas páginas de autenticación y finanzas
import Login    from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Finanzas from '../pages/Finanzas/Finanzas.jsx';

// Guardia de rutas privadas
import PrivateRoute from './Privateroute.jsx';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/"        element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas — redirigen a /login si no hay sesión */}
        <Route path="/home" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />
        <Route path="/grupo/:id" element={
          <PrivateRoute><DetalleGrupo /></PrivateRoute>
        } />
        <Route path="/finanzas" element={
          <PrivateRoute><Finanzas /></PrivateRoute>
        } />

        {/* Cualquier ruta desconocida → Welcome */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;