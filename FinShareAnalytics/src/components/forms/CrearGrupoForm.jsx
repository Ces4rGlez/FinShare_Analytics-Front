import { useState, useEffect } from 'react';
import grupoService from '../../services/grupoService';
import Button from '../common/Button';

const GROUP_TYPES = [
  { value: 'roommates', label: 'Hogar / Roomies' },
  { value: 'travel',    label: 'Viaje' },
  { value: 'project',   label: 'Trabajo / Proyecto' },
  { value: 'other',     label: 'Otro / Amigos' },
];

const CrearGrupoForm = ({ onGrupoGuardado, onCancelar, grupoAEditar = null }) => {
  const [formData, setFormData] = useState({ name: '', description: '', groupType: 'roommates' });
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (grupoAEditar) {
      setFormData({
        name:      grupoAEditar.name,
        description: grupoAEditar.description,
        groupType: grupoAEditar.groupType,
      });
    } else {
      setFormData({ name: '', description: '', groupType: 'roommates' });
    }
  }, [grupoAEditar]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      if (grupoAEditar) {
        await grupoService.actualizar(grupoAEditar._id, formData);
      } else {
        await grupoService.crear(formData);
      }
      onGrupoGuardado();
    } catch (err) {
      const det = err.response?.data?.details || err.response?.data?.error;
      setError(typeof det === 'object' ? JSON.stringify(det) : (det || 'Error al guardar el grupo.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="form-crear-grupo" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error && (
        <div style={{
          background: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.3)',
          color: 'var(--color-danger)', padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)'
        }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="grupo-name">Nombre del grupo *</label>
        <input
          id="grupo-name" name="name" type="text"
          placeholder="Ej: Departamento Centro"
          value={formData.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="grupo-desc">Descripción</label>
        <textarea
          id="grupo-desc" name="description"
          placeholder="¿Para qué es este grupo?"
          value={formData.description} onChange={handleChange}
          rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div className="form-group">
        <label htmlFor="grupo-type">Tipo de grupo</label>
        <select id="grupo-type" name="groupType" value={formData.groupType} onChange={handleChange}>
          {GROUP_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" loading={cargando} id="btn-submit-grupo">
          {grupoAEditar ? 'Guardar Cambios' : 'Crear Grupo'}
        </Button>
      </div>
    </form>
  );
};

export default CrearGrupoForm;