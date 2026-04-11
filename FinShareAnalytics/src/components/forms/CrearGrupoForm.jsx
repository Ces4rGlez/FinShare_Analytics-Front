import { useState, useEffect } from 'react';
import grupoService from '../../services/grupoService';

// Agregamos el prop grupoAEditar (por defecto será null)
const CrearGrupoForm = ({ onGrupoGuardado, onCancelar, grupoAEditar = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupType: 'other'
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // EFECTO: Si nos pasan un grupo para editar, llenamos el formulario con sus datos
  useEffect(() => {
    if (grupoAEditar) {
      setFormData({
        name: grupoAEditar.name,
        description: grupoAEditar.description,
        groupType: grupoAEditar.groupType
      });
    } else {
      // Si no hay grupo, limpiamos el formulario para crear uno nuevo
      setFormData({ name: '', description: '', groupType: 'other' });
    }
  }, [grupoAEditar]); // Se ejecuta cada vez que cambia el grupo a editar

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      if (grupoAEditar) {
        // MODO EDICIÓN: Usamos actualizar() pasándole el ID
        await grupoService.actualizar(grupoAEditar._id, formData);
      } else {
        // MODO CREACIÓN: Usamos crear()
        await grupoService.crear(formData);
      }
      
      setFormData({ name: '', description: '', groupType: 'other' });
      onGrupoGuardado(); // Le avisamos al Home que terminamos
    } catch (err) {
      console.error("Error completo del backend:", err.response?.data);
      const detalleError = err.response?.data?.details || err.response?.data?.error;
      const mensajeMostrar = typeof detalleError === 'object' 
        ? JSON.stringify(detalleError) 
        : (detalleError || "Hubo un error al guardar el grupo.");
      setError(mensajeMostrar);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8fdfb', padding: '2rem', borderRadius: '12px', 
      border: '1px solid #1d7e6b', marginBottom: '2rem', textAlign: 'left'
    }}>
      {/* El título cambia dinámicamente */}
      <h3 style={{ color: '#1d7e6b', marginTop: 0 }}>
        {grupoAEditar ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
      </h3>
      
      {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Nombre del Grupo *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required 
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Descripción</label>
          <textarea name="description" value={formData.description} onChange={handleChange} 
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '60px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Tipo de Grupo</label>
          <select name="groupType" value={formData.groupType} onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="roommates">roomies</option>
            <option value="travel">travel</option>
            <option value="project">project</option>
            <option value="other">other</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={cargando}
            style={{ backgroundColor: '#1d7e6b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: cargando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {/* El texto del botón cambia dinámicamente */}
            {cargando ? 'Guardando...' : (grupoAEditar ? 'Guardar Cambios' : 'Crear Grupo')}
          </button>
          
          <button type="button" onClick={onCancelar}
            style={{ backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearGrupoForm;