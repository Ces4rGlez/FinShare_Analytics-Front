import { useEffect, useState } from 'react';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  PlusIcon, FunnelIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import transactionService from '../../services/transactionService';
import './Transactions.css';

const CATEGORIES = ['food','transport','entertainment','services','other','health','education','clothing'];
const INCOME_CATS = ['salary','freelance','investment','bonus','gift','other'];

const CATEGORY_LABELS = {
  food: 'Alimentación',
  transport: 'Transporte',
  entertainment: 'Entretenimiento',
  services: 'Servicios',
  other: 'Otros',
  health: 'Salud',
  education: 'Educación',
  clothing: 'Ropa',
  salary: 'Salario',
  freelance: 'Freelance',
  investment: 'Inversión',
  bonus: 'Bono',
  gift: 'Regalo',
};

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];

const EMPTY = { type: 'expense', amount: '', concept: '', category: '', date: today(), note: '' };

export default function Transactions() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState('all'); // 'all' | 'income' | 'expense'
  const [form, setForm]       = useState(EMPTY);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.list();
      // El backend usa paginated_response que pone los items directamente en la raíz de 'data'
      setTransactionsList(Array.isArray(data) ? data : (data.items || []));
    } catch { 
      setTransactionsList([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Aligned with backend TransactionSchema: no wrapper, uses transactionDate
      await transactionService.create({
        type:            form.type,
        amount:          Number(form.amount),
        concept:         form.concept,
        category:        form.category || 'other',
        transactionDate: form.date, // Backend expects transactionDate
        notes:           form.note,
      });
      setModalOpen(false);
      setForm(EMPTY);
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la transacción.');
    } finally { setSaving(false); }
  };

  const [transactionsList, setTransactionsList] = useState([]);
  const filtered = transactionsList.filter(t =>
    filter === 'all' ? true : t.type === filter
  );

  const totalIncome  = transactionsList.filter(t => t.type === 'income').reduce((a, t) => a + (t.amount || 0), 0);
  const totalExpense = transactionsList.filter(t => t.type !== 'income').reduce((a, t) => a + (t.amount || 0), 0);
  const balance      = totalIncome - totalExpense;

  const cats = form.type === 'income' ? INCOME_CATS : CATEGORIES;

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header tx-page-header">
          <div>
            <h1 className="page-title">Transacciones</h1>
            <p className="page-subtitle">Registra y controla tus movimientos financieros</p>
          </div>
          <Button icon={PlusIcon} onClick={() => { setForm(EMPTY); setModalOpen(true); }} id="btn-nueva-tx">
            Nueva Transacción
          </Button>
        </div>

        {/* Summary row */}
        <div className="tx-summary-row">
          <div className="tx-summary-card tx-summary-balance">
            <span className="tx-sum-label">Balance Neto</span>
            <span className={`tx-sum-val ${balance >= 0 ? 'pos' : 'neg'}`}>{fmt(balance)}</span>
          </div>
          <div className="tx-summary-card tx-summary-income">
            <ArrowTrendingUpIcon style={{ width: 20, color: 'var(--color-success)' }} />
            <div>
              <span className="tx-sum-label">Total Ingresos</span>
              <span className="tx-sum-val pos">{fmt(totalIncome)}</span>
            </div>
          </div>
          <div className="tx-summary-card tx-summary-expense">
            <ArrowTrendingDownIcon style={{ width: 20, color: 'var(--color-danger)' }} />
            <div>
              <span className="tx-sum-label">Total Gastos</span>
              <span className="tx-sum-val neg">{fmt(totalExpense)}</span>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="tx-filter-bar">
          <FunnelIcon style={{ width: 16, color: 'var(--color-text-muted)' }} />
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              className={`tx-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              id={`tx-filter-${f}`}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="card">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ArrowTrendingUpIcon style={{ width: 48, height: 48, color: 'var(--color-text-muted)', opacity: 0.3 }} />
              <p className="empty-state-title">Sin transacciones</p>
              <p className="empty-state-text">Registra tu primer movimiento financiero</p>
              <Button icon={PlusIcon} onClick={() => setModalOpen(true)} style={{ marginTop: 8 }} id="btn-nueva-tx-empty">
                Agregar
              </Button>
            </div>
          ) : (
            <div className="tx-full-list">
              {[...filtered].reverse().map((tx, i) => (
                <div key={tx._id || i} className="tx-row">
                  <div className={`tx-type-dot ${tx.type === 'income' ? 'dot-income' : 'dot-expense'}`} />
                  <div className="tx-row-icon">
                    {tx.type === 'income'
                      ? <ArrowTrendingUpIcon style={{ width: 18 }} />
                      : <ArrowTrendingDownIcon style={{ width: 18 }} />}
                  </div>
                  <div className="tx-row-info">
                    <p className="tx-row-concept">{tx.concept || 'Movimiento'}</p>
                    <div className="tx-row-meta">
                      <span className="tx-row-cat">{CATEGORY_LABELS[tx.category] || tx.category || 'General'}</span>
                      {tx.transactionDate && <span className="tx-row-date">{new Date(tx.transactionDate).toLocaleDateString('es-MX')}</span>}
                    </div>
                  </div>
                  <span className={`tx-row-amount ${tx.type === 'income' ? 'pos' : 'neg'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Transacción">
        <form onSubmit={handleSave} id="form-transaction" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Type toggle */}
          <div className="tx-type-toggle">
            <button type="button"
              className={`tx-type-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}>
              <ArrowTrendingDownIcon style={{ width: 16 }} /> Gasto
            </button>
            <button type="button"
              className={`tx-type-btn ${form.type === 'income' ? 'active-income' : ''}`}
              onClick={() => setForm(f => ({ ...f, type: 'income', category: '' }))}>
              <ArrowTrendingUpIcon style={{ width: 16 }} /> Ingreso
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="tx-concept">Concepto</label>
            <input id="tx-concept" name="concept" placeholder="¿En qué fue?"
              value={form.concept} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="tx-amount">Monto ($)</label>
              <input id="tx-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="tx-date">Fecha</label>
              <input id="tx-date" name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tx-category">Categoría</label>
            <select id="tx-category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Selecciona una categoría</option>
              {cats.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} id="btn-save-transaction">Guardar</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
