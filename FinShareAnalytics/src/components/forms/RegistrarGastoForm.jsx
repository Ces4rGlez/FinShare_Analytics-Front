import { useState, useEffect } from 'react';
import expenseService from '../../services/expenseService';
import Button from '../common/Button';

const RegistrarGastoForm = ({ grupo, onGastoGuardado, onCancelar, gastoAEditar }) => {
  const [concept, setConcept] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('food');
  
  const [participantesIds, setParticipantesIds] = useState(
    grupo.members.map(m => m.userId)
  );
  const [pagadorId, setPagadorId] = useState(grupo.members[0]?.userId || '');
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gastoAEditar) {
      setConcept(gastoAEditar.concept);
      setTotalAmount(gastoAEditar.totalAmount);
      setCategory(gastoAEditar.category || 'food');
      const idsExistentes = gastoAEditar.splits.map(s => s.userId);
      setParticipantesIds(idsExistentes);
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

    const montoTotalFloat = Math.round(parseFloat(totalAmount) * 100) / 100;
    const count = participantesIds.length;
    const baseAmount = Math.floor((montoTotalFloat / count) * 100) / 100;
    const remainder = Math.round((montoTotalFloat - (baseAmount * count)) * 100) / 100;

    const splits = participantesIds.map((userId, index) => {
      const miembro = grupo.members.find(m => m.userId === userId);
      // El primer participante absorbe el remanente de centavos
      const amountOwed = index === 0 ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount;
      
      return {
        userId: miembro.userId,
        userName: miembro.displayName,
        amountOwed: amountOwed,
        amountPaid: userId === pagadorId ? montoTotalFloat : 0.0
      };
    });

    const payload = {
      concept: concept,
      totalAmount: montoTotalFloat,
      category: category,
      currency: "MXN",
      splits: splits,
    };

    try {
      if (gastoAEditar) {
        await expenseService.actualizar(gastoAEditar._id, payload);
      } else {
        await expenseService.crear(grupo._id, payload);
      }
      onGastoGuardado(); 
    } catch (err) {
      setError("Error al procesar el gasto. Verifica la conexión.");
    } finally {
      setCargando(false);
    }
  };

  const montoVisual = totalAmount && participantesIds.length > 0 
    ? (parseFloat(totalAmount) / participantesIds.length).toFixed(2) 
    : "0.00";

  return (
    <div className="card-glass" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', animation: 'scale-in 0.3s ease' }}>
      <h3 style={{ marginBottom: 'var(--space-5)', color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)' }}>
        {gastoAEditar ? `Editar: ${gastoAEditar.concept}` : 'Registrar Nuevo Gasto'}
      </h3>
      
      {error && (
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label>¿Qué se pagó?</label>
            <input type="text" value={concept} onChange={(e) => setConcept(e.target.value)} required placeholder="Ej. Cena de Tacos" />
          </div>
          <div className="form-group">
            <label>Monto Total ($)</label>
            <input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required placeholder="0.00" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="food">Comida / Despensa</option>
              <option value="rent">Renta</option>
              <option value="transport">Transporte</option>
              <option value="entertainment">Entretenimiento</option>
              <option value="services">Servicios</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>¿Quién pagó?</label>
            <select value={pagadorId} onChange={(e) => setPagadorId(e.target.value)}>
              {grupo.members.map(m => (
                <option key={m.userId} value={m.userId}>{m.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-3)', fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
            Dividir entre ({participantesIds.length}): <span style={{ color: 'var(--color-primary)' }}>${montoVisual} c/u</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)', background: 'var(--color-surface-2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {grupo.members.map(m => (
              <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={participantesIds.includes(m.userId)} 
                  onChange={() => toggleParticipante(m.userId)}
                  style={{ width: '16px', height: '16px' }}
                />
                {m.displayName}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <Button type="submit" loading={cargando} fullWidth>
            {gastoAEditar ? 'Guardar Cambios' : 'Registrar Gasto'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>

      </form>
    </div>
  );
};

export default RegistrarGastoForm;