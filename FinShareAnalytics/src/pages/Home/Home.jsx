import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import grupoService from '../../services/grupoService';
import authService  from '../../services/authService';
import CrearGrupoForm from '../../components/forms/CrearGrupoForm';
import { PencilSquareIcon, TrashIcon, ArrowRightOnRectangleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import '../../assets/styles/Home.css';

function Home() {
  const [grupos, setGrupos]               = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  const navigate = useNavigate();

  // Datos del usuario logueado
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const cargarGrupos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await grupoService.obtenerTodos();
      setGrupos(data);
    } catch (err) {
      console.error('Error obteniendo grupos:', err);
      setError('No se pudieron cargar los grupos. Verifica que el servidor Flask esté encendido.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  const handleGrupoGuardado = () => {
    setMostrarFormulario(false);
    setGrupoEditando(null);
    cargarGrupos();
  };

  const abrirFormularioCreacion = () => {
    setGrupoEditando(null);
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleEliminarGrupo = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el grupo "${nombre}"?`);
    if (confirmar) {
      try {
        await grupoService.eliminar(id);
        cargarGrupos();
      } catch (err) {
        console.error('Error al eliminar el grupo:', err);
        alert('Hubo un error al eliminar el grupo. Intenta nuevamente.');
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <section className="home-section">

      {/* Barra superior con usuario y acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
          Hola, <strong style={{ color: '#1a2e2b' }}>{user.fullName || 'Usuario'}</strong>
        </span>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Ir a Finanzas */}
          <button
            onClick={() => navigate('/finanzas')}
            title="Mis Finanzas"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e8f5f3', color: '#1d7e6b', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <BanknotesIcon style={{ width: '18px', height: '18px' }} />
            Mis Finanzas
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fdecea', color: '#c0392b', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <ArrowRightOnRectangleIcon style={{ width: '18px', height: '18px' }} />
            Salir
          </button>
        </div>
      </div>

      <h1 className="home-title">Dashboard Principal</h1>
      <p className="home-description">
        Bienvenido al panel de control de FinShare Analytics.
        Aquí podrás visualizar métricas financieras, gráficos y reportes en tiempo real.
      </p>

      <div className="groups-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="groups-title" style={{ margin: 0 }}>Tus Grupos Activos</h2>
          <button
            onClick={abrirFormularioCreacion}
            style={{ backgroundColor: '#1d7e6b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {mostrarFormulario && !grupoEditando ? 'Cancelar' : '+ Nuevo Grupo'}
          </button>
        </div>

        {mostrarFormulario && (
          <CrearGrupoForm
            grupoAEditar={grupoEditando}
            onGrupoGuardado={handleGrupoGuardado}
            onCancelar={() => { setMostrarFormulario(false); setGrupoEditando(null); }}
          />
        )}

        {cargando && <p className="status-message loading">Cargando información financiera...</p>}
        {error    && <p className="status-message error">{error}</p>}
        {!cargando && !error && grupos.length === 0 && (
          <p className="status-message empty">No tienes grupos creados aún. ¡Es momento de crear el primero!</p>
        )}

        {!cargando && !error && grupos.length > 0 && (
          <div className="groups-grid">
            {grupos.map((grupo) => (
              <div
                key={grupo._id}
                className="group-card"
                onClick={() => navigate(`/grupo/${grupo._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="group-card-title">{grupo.name}</h3>
                <p className="group-card-description">{grupo.description}</p>

                <div className="group-card-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="group-badge">{grupo.groupType}</span>
                    <span className="group-members-count">{grupo.members?.length || 0} miembros</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGrupoEditando(grupo); setMostrarFormulario(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      title="Editar grupo"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e)  => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <PencilSquareIcon style={{ width: '22px', height: '22px', color: '#3498db' }} />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminarGrupo(grupo._id, grupo.name); }}
                      title="Eliminar grupo"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e)  => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <TrashIcon style={{ width: '22px', height: '22px', color: '#e74c3c' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;