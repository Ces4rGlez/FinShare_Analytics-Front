import { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import finanzasService from '../../services/finanzasService';
import '../../assets/styles/Finanzas.css';

const FORM_INICIAL = {
  concepto: '',
  monto: '',
  tipo: 'ingreso',
  categoria: '',
  fecha: new Date().toISOString().split('T')[0],
  notas: '',
};

const CATEGORIAS = {
  ingreso: ['Salario', 'Freelance', 'Inversión', 'Regalo', 'Otro'],
  egreso:  ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Ropa', 'Servicios', 'Otro'],
};

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// El backend devuelve 'income'/'expense' → los normalizamos a 'ingreso'/'egreso' para el CSS
function normalizarTipo(type) {
  return type === 'income' ? 'ingreso' : 'egreso';
}

function Finanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState(FORM_INICIAL);
  const [guardando, setGuardando]     = useState(false);
  const [formError, setFormError]     = useState(null);

  const cargarMovimientos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await finanzasService.obtenerMovimientos();
      // La respuesta paginada viene en data.data.items
      setMovimientos(data.data || []);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
      setError('No se pudieron cargar los movimientos. Verifica que el servidor Flask esté activo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarMovimientos(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'tipo') updated.categoria = '';
      return updated;
    });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.concepto.trim()) return setFormError('El concepto es obligatorio.');
    if (!form.monto || Number(form.monto) <= 0) return setFormError('Ingresa un monto válido mayor a 0.');

    setGuardando(true);
    setFormError(null);
    try {
      await finanzasService.registrarMovimiento({
        concepto:  form.concepto.trim(),
        monto:     parseFloat(form.monto),
        tipo:      form.tipo,
        categoria: form.categoria || 'other',
        fecha:     form.fecha,
        notas:     form.notas.trim(),
      });
      setForm(FORM_INICIAL);
      setMostrarForm(false);
      await cargarMovimientos();
    } catch (err) {
      setFormError(err.message || 'Error al guardar el movimiento.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este movimiento?')) return;
    try {
      await finanzasService.eliminarMovimiento(id);
      await cargarMovimientos();
    } catch (err) {
      alert('No se pudo eliminar el movimiento.');
    }
  };

  // Totales usando el campo 'type' del backend
  const totalIngresos = movimientos
    .filter((m) => m.type === 'income')
    .reduce((acc, m) => acc + (m.amount || 0), 0);

  const totalEgresos = movimientos
    .filter((m) => m.type === 'expense')
    .reduce((acc, m) => acc + (m.amount || 0), 0);

  const balance = totalIngresos - totalEgresos;

  return (
    <section className="finanzas-section">
      <div className="finanzas-header">
        <h1 className="finanzas-title">Mis Finanzas</h1>
        <button
          className="btn-primario"
          onClick={() => { setMostrarForm((v) => !v); setFormError(null); setForm(FORM_INICIAL); }}
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo Movimiento'}
        </button>
      </div>

      {/* Resumen */}
      <div className="finanzas-resumen">
        <div className="resumen-card ingresos">
          <p className="resumen-label">Ingresos</p>
          <p className="resumen-monto">{formatMoney(totalIngresos)}</p>
        </div>
        <div className="resumen-card egresos">
          <p className="resumen-label">Egresos</p>
          <p className="resumen-monto">{formatMoney(totalEgresos)}</p>
        </div>
        <div className="resumen-card balance">
          <p className="resumen-label">Balance</p>
          <p className="resumen-monto">{formatMoney(balance)}</p>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="movimiento-form-wrapper">
          <p className="movimiento-form-titulo">Registrar nuevo movimiento</p>
          <form className="movimiento-form" onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="form-group">
              <label htmlFor="concepto">Concepto *</label>
              <input id="concepto" name="concepto" type="text" value={form.concepto}
                onChange={handleChange} placeholder="Ej. Pago de renta" required />
            </div>

            <div className="form-group">
              <label htmlFor="monto">Monto *</label>
              <input id="monto" name="monto" type="number" min="0.01" step="0.01"
                value={form.monto} onChange={handleChange} placeholder="0.00" required />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo *</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" name="categoria" value={form.categoria} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {CATEGORIAS[form.tipo].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} />
            </div>

            <div className="form-group form-full">
              <label htmlFor="notas">Notas</label>
              <textarea id="notas" name="notas" value={form.notas} onChange={handleChange}
                placeholder="Descripción adicional (opcional)" />
            </div>

            <div className="form-acciones form-full">
              <button className="btn-primario" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Movimiento'}
              </button>
              <button type="button" className="btn-cancelar"
                onClick={() => { setMostrarForm(false); setFormError(null); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <p className="movimientos-titulo">Historial de Movimientos</p>

      {cargando && <p className="status-message loading">Cargando movimientos...</p>}
      {error    && <p className="status-message error">{error}</p>}
      {!cargando && !error && movimientos.length === 0 && (
        <p className="status-message empty">No tienes movimientos registrados. ¡Agrega el primero!</p>
      )}

      {!cargando && !error && movimientos.length > 0 && (
        <div className="movimientos-lista">
          {movimientos.map((mov) => {
            const tipo = normalizarTipo(mov.type);
            return (
              <div key={mov._id} className={`movimiento-item ${tipo}`}>
                <div className="movimiento-info">
                  <p className="movimiento-concepto">{mov.concept}</p>
                  <div className="movimiento-meta">
                    {mov.category && (
                      <span className="movimiento-categoria">{mov.category}</span>
                    )}
                    {mov.transactionDate && (
                      <span>{new Date(mov.transactionDate).toLocaleDateString('es-MX')}</span>
                    )}
                    {mov.notes && <span>{mov.notes}</span>}
                  </div>
                </div>

                <span className={`movimiento-monto ${tipo}`}>
                  {tipo === 'ingreso' ? '+' : '-'} {formatMoney(mov.amount)}
                </span>

                <button
                  className="btn-eliminar-mov"
                  title="Eliminar movimiento"
                  onClick={() => handleEliminar(mov._id)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseOut={(e)  => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <TrashIcon style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Finanzas;