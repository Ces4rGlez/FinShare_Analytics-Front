import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, UsersIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import grupoService from '../../services/grupoService';
import CrearGrupoForm from '../../components/forms/CrearGrupoForm';
import './Groups.css';

const GROUP_TYPE_COLS = {
  travel: '#176977ff',
  roommates: '#3ca56fff',
  other: '#693140ff',
  project: '#485330ff',
};

const GROUP_TYPE_LABELS = {
  roommates: 'Hogar / Roomies',
  travel: 'Viaje',
  project: 'Proyecto / Trabajo',
  other: 'Otro / Amigos',
};

export default function Groups() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await grupoService.obtenerTodos();
      setGrupos(data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (e, id, nombre) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el grupo "${nombre}"?`)) return;
    try {
      await grupoService.eliminar(id);
      cargar();
    } catch { alert('No se pudo eliminar el grupo.'); }
  };

  const handleEditar = (e, grupo) => {
    e.stopPropagation();
    setEditTarget(grupo);
    setModalOpen(true);
  };

  const filtered = grupos.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header groups-page-header">
          <div>
            <h1 className="page-title">Mis Grupos</h1>
            <p className="page-subtitle">Administra tus grupos de gastos compartidos</p>
          </div>
          <Button
            icon={PlusIcon}
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            id="btn-nuevo-grupo"
          >
            Nuevo Grupo
          </Button>
        </div>

        {/* Search Bar */}
        <div className="groups-search-bar">
          <MagnifyingGlassIcon style={{ width: 18, height: 18, color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="input-search-grupos"
            style={{ background: 'transparent', border: 'none', flex: 1, padding: 0 }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="groups-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UserGroupIcon className="empty-state-icon" />
            <p className="empty-state-title">{search ? 'Sin resultados' : 'Sin grupos aún'}</p>
            <p className="empty-state-text">
              {search ? 'Prueba con otro nombre' : 'Crea tu primer grupo para empezar a dividir gastos'}
            </p>
            {!search && (
              <Button icon={PlusIcon} onClick={() => setModalOpen(true)} style={{ marginTop: 8 }}>
                Crear grupo
              </Button>
            )}
          </div>
        ) : (
          <div className="groups-grid">
            {filtered.map(grupo => {
              const accColor = GROUP_TYPE_COLS[grupo.groupType?.toLowerCase()] || 'var(--color-primary)';
              return (
                <div
                  key={grupo._id}
                  className="group-card-pro"
                  onClick={() => navigate(`/grupo/${grupo._id}`)}
                  style={{ '--accent': accColor }}
                  id={`group-card-${grupo._id}`}
                >
                  <div className="gcp-body">
                    <div className="gcp-top">
                      <div className="gcp-avatar">
                        {grupo.name?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="gcp-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="gcp-action-btn"
                          onClick={e => handleEditar(e, grupo)}
                          title="Editar"
                        >
                          <PencilSquareIcon style={{ width: 16 }} />
                        </button>
                        <button
                          className="gcp-action-btn gcp-delete"
                          onClick={e => handleEliminar(e, grupo._id, grupo.name)}
                          title="Eliminar"
                        >
                          <TrashIcon style={{ width: 16 }} />
                        </button>
                      </div>
                    </div>

                    <h3 className="gcp-name">{grupo.name}</h3>
                    <p className="gcp-desc">{grupo.description || 'Sin descripción'}</p>

                    <div className="gcp-footer">
                      <span className="gcp-badge">
                        {GROUP_TYPE_LABELS[grupo.groupType] || grupo.groupType || 'General'}
                      </span>
                      <span className="gcp-members">
                        <UsersIcon style={{ width: 13 }} />
                        {grupo.members?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        title={editTarget ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
      >
        <CrearGrupoForm
          grupoAEditar={editTarget}
          onGrupoGuardado={() => { setModalOpen(false); setEditTarget(null); cargar(); }}
          onCancelar={() => { setModalOpen(false); setEditTarget(null); }}
        />
      </Modal>
    </AppLayout>
  );
}
