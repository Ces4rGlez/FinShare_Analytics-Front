import { useEffect, useState } from 'react';
import grupoService from '../../services/grupoService';
import CrearGrupoForm from '../../components/forms/CrearGrupoForm';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);

  const navigate = useNavigate();

  const cargarGrupos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await grupoService.obtenerTodos();
      setGrupos(data);
    } catch (err) {
      console.error("Error obteniendo grupos:", err);
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
        console.error("Error al eliminar el grupo:", err);
        alert("Hubo un error al eliminar el grupo. Intenta nuevamente.");
      }
    }
  };

  return (
    <section className="home-section">
      <div className="home-header animate-fade-in">
        <div className="home-header-content">
          <h1 className="home-title">Bienvenido a FinShare</h1>
          <p className="home-description">
            Gestiona tus grupos, analiza riesgos y simula escenarios financieros con inteligencia artificial.
          </p>
        </div>
        <button
          onClick={abrirFormularioCreacion}
          className="btn btn-primary"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {mostrarFormulario && !grupoEditando ? 'Cancelar' : '+ Nuevo Grupo'}
        </button>
      </div>

      <div className="groups-container">
        <div className="groups-header-row animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="groups-title">Tus Grupos Activos</h2>
        </div>

        {mostrarFormulario && (
          <div className="animate-scale-in" style={{ marginBottom: 'var(--space-8)' }}>
            <CrearGrupoForm
              grupoAEditar={grupoEditando}
              onGrupoGuardado={handleGrupoGuardado}
              onCancelar={() => {
                setMostrarFormulario(false);
                setGrupoEditando(null);
              }}
            />
          </div>
        )}

        {cargando && (
          <div className="groups-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 24 }} />)}
          </div>
        )}
        
        {error && <p className="status-message error">{error}</p>}
        
        {!cargando && !error && grupos.length === 0 && (
          <div className="card empty-state animate-fade-in" style={{ padding: 'var(--space-12) 0' }}>
            <p className="empty-state-text">No tienes grupos creados aún. ¡Es momento de crear el primero!</p>
          </div>
        )}

        {!cargando && !error && grupos.length > 0 && (
          <div className="groups-grid">
            {grupos.map((grupo, idx) => (
              <div
                key={grupo._id}
                className="group-card animate-fade-in"
                onClick={() => navigate(`/grupo/${grupo._id}`)}
                style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="group-card-title">{grupo.name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGrupoEditando(grupo);
                        setMostrarFormulario(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-tiny"
                      title="Editar"
                    >
                      <PencilSquareIcon style={{ width: '16px' }} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarGrupo(grupo._id, grupo.name);
                      }}
                      className="btn-tiny"
                      style={{ color: 'var(--color-danger)' }}
                      title="Eliminar"
                    >
                      <TrashIcon style={{ width: '16px' }} />
                    </button>
                  </div>
                </div>

                <p className="group-card-description">{grupo.description}</p>

                <div className="group-card-footer">
                  <span className="group-badge">{grupo.groupType}</span>
                  <span className="group-members-count">
                    {grupo.members?.length || 0} miembros
                  </span>
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