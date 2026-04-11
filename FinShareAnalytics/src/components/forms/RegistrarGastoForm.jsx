import { useState, useEffect } from 'react';
import expenseService from '../../services/expenseService';

const RegistrarGastoForm = ({ grupo, onGastoGuardado, onCancelar, gastoAEditar }) => {
  // Estados básicos del formulario
  const [concept, setConcept] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('food');
  
  // Estados para la lógica matemática
  const [participantesIds, setParticipantesIds] = useState(
    grupo.members.map(m => m.userId)
  );
  const [pagadorId, setPagadorId] = useState(grupo.members[0]?.userId || '');
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // EFECTO PARA EDICIÓN: Si recibimos un gasto para editar, llenamos los campos
  useEffect(() => {
    if (gastoAEditar) {
      setConcept(gastoAEditar.concept);
      setTotalAmount(gastoAEditar.totalAmount);
      setCategory(gastoAEditar.category || 'food');
      
      // Extraemos los IDs de los que participan en este gasto específico
      const idsExistentes = gastoAEditar.splits.map(s => s.userId);
      setParticipantesIds(idsExistentes);
      
      // El pagador es quien tenga amountPaid > 0 o simplemente el paidBy
      setPagadorId(gastoAEditar.paidBy || gastoAEditar.splits.find(s => s.amountPaid > 0)?.userId);
    }
  }, [gastoAEditar]);

  const toggleParticipante = (userId) => {
    if (participantesIds.includes(userId)) {
      setParticipantesIds(participantesIds.filter(id => id !== userId));
    } else {
      setParticipantesIds([...participantesIds, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (participantesIds.length === 0) {
      setError("Debes seleccionar al menos a un participante.");
      return;
    }

    setCargando(true);
    setError(null);

    const montoTotalFloat = parseFloat(totalAmount);
    const montoPorPersona = montoTotalFloat / participantesIds.length;

    const splits = participantesIds.map(userId => {
      const miembro = grupo.members.find(m => m.userId === userId);
      return {
        userId: miembro.userId,
        userName: miembro.displayName,
        amountOwed: parseFloat(montoPorPersona.toFixed(2)),
        amountPaid: userId === pagadorId ? parseFloat(montoPorPersona.toFixed(2)) : 0.0
      };
    });

    const payload = {
      concept: concept,
      totalAmount: montoTotalFloat,
      category: category,
      currency: "MXN",
      splits: splits,
      // Pasamos también el pagador principal para el backend
      paidBy: pagadorId 
    };

    try {
      if (gastoAEditar) {
        // MODO EDICIÓN: Usamos PATCH
        await expenseService.actualizar(gastoAEditar._id, payload);
      } else {
        // MODO CREACIÓN: Usamos POST
        await expenseService.crear(grupo._id, payload);
      }
      onGastoGuardado(); 
    } catch (err) {
      console.error(err);
      setError("Error al procesar el gasto. Verifica la conexión con Flask.");
    } finally {
      setCargando(false);
    }
  };

  const montoVisual = totalAmount && participantesIds.length > 0 
    ? (parseFloat(totalAmount) / participantesIds.length).toFixed(2) 
    : "0.00";

  return (
    <div style={{ backgroundColor: gastoAEditar ? '#fdf8f3' : '#f8fdfb', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${gastoAEditar ? '#e67e22' : '#1d7e6b'}`, marginBottom: '1.5rem' }}>
      <h3 style={{ marginTop: 0, color: gastoAEditar ? '#e67e22' : '#1d7e6b' }}>
        {gastoAEditar ? `Editando: ${gastoAEditar.concept}` : 'Nuevo Gasto'}
      </h3>
      
      {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>¿Qué se pagó?</label>
            <input type="text" value={concept} onChange={(e) => setConcept(e.target.value)} required placeholder="Ej. Cena de Tacos" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Monto ($)</label>
            <input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required placeholder="0.00" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="food">Comida / Despensa</option>
              <option value="rent">Renta</option>
              <option value="transport">Transporte</option>
              <option value="entertainment">Entretenimiento</option>
              <option value="services">Servicios (Luz, Agua)</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>¿Quién pagó?</label>
            <select value={pagadorId} onChange={(e) => setPagadorId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              {grupo.members.map(m => (
                <option key={m.userId} value={m.userId}>{m.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>
            Se divide entre ({participantesIds.length}): <span style={{ color: gastoAEditar ? '#e67e22' : '#1d7e6b' }}>${montoVisual} c/u</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
            {grupo.members.map(m => (
              <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={participantesIds.includes(m.userId)} 
                  onChange={() => toggleParticipante(m.userId)}
                />
                {m.displayName}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
          <button type="submit" disabled={cargando} style={{ backgroundColor: gastoAEditar ? '#e67e22' : '#1d7e6b', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
            {cargando ? 'Guardando...' : (gastoAEditar ? 'Actualizar Gasto' : 'Registrar Gasto')}
          </button>
          <button type="button" onClick={onCancelar} style={{ backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
};

export default RegistrarGastoForm;