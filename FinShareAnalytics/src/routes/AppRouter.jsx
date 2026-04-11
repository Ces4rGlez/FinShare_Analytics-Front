import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from '../pages/Welcome/Welcome.jsx';
import Home from '../pages/Home/Home.jsx';
import DetalleGrupo from '../pages/Groups/DetalleGrupo.jsx';

// Configuración de rutas para la aplicación FinShare Analytics

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/grupo/:id" element={<DetalleGrupo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
