import { useEffect, useState } from 'react';
import {
  UserCircleIcon, PencilIcon, CheckIcon, PlusIcon, TrashIcon,
  BanknotesIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Profile.css';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

const DEBT_EMPTY = { creditor: '', totalAmount: '', monthlyPayment: '', type: 'other' };

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [debtModal, setDebtModal] = useState(false);
  const [savingDebt, setSavingDebt] = useState(false);
  const [finForm, setFinForm]   = useState({ 
    monthly_income: '', 
    savings_goal: '',
    fixed_expenses: '',
    variable_expenses: '',
    income_stability: 'stable'
  });
  const [debtForm, setDebtForm] = useState(DEBT_EMPTY);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFinForm({
        monthly_income:    data.finance?.monthlyIncome    ?? '',
        savings_goal:      data.finance?.savings          ?? '',
        fixed_expenses:    data.finance?.fixedExpenses     ?? '',
        variable_expenses: data.finance?.variableExpenses ?? '',
        income_stability:  data.finance?.incomeStability  ?? 'stable',
      });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleFinSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateFinance({
        monthlyIncome:    Number(finForm.monthly_income),
        savings:          Number(finForm.savings_goal),
        fixedExpenses:    Number(finForm.fixed_expenses),
        variableExpenses: Number(finForm.variable_expenses),
        incomeStability:  finForm.income_stability,
      });
      await refreshUser();
      loadProfile();
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar.');
    } finally { setSaving(false); }
  };

  const handleDebtSave = async (e) => {
    e.preventDefault();
    setSavingDebt(true);
    try {
      await authService.addDebt({
        creditor:         debtForm.creditor,
        totalAmount:      Number(debtForm.totalAmount),
        remainingAmount:  Number(debtForm.totalAmount), // Default to total
        monthlyPayment:   Number(debtForm.monthlyPayment),
        debtType:         debtForm.type,
        isActive:         true,
      });
      setDebtModal(false);
      setDebtForm(DEBT_EMPTY);
      loadProfile();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar deuda.');
    } finally { setSavingDebt(false); }
  };

  const debts       = profile?.finance?.debts ?? profile?.debts ?? [];
  const income      = Number(finForm.monthly_income || 0);
  const savingsGoal = Number(finForm.savings_goal || 0);
  const totalDebt   = debts.reduce((a, d) => a + (Number(d.remainingAmount) || 0), 0);
  const initials    = (user?.name || 'FS').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Administra tu información personal y financiera</p>
        </div>

        <div className="profile-layout">
          {/* Left: User Card */}
          <div className="profile-user-card card">
            <div className="profile-avatar-big">{initials}</div>
            <h2 className="profile-name">{user?.name || '—'}</h2>
            <p className="profile-email">{user?.email || '—'}</p>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-label">Ingreso Mensual</span>
                <span className="profile-stat-val">{fmt(income)}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-label">Meta de Ahorro</span>
                <span className="profile-stat-val">{fmt(savingsGoal)}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-label">Total Deudas</span>
                <span className="profile-stat-val" style={{ color: totalDebt > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {fmt(totalDebt)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Finance Form + Debts */}
          <div className="profile-right">
            {/* Finance Edit */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 className="chart-title">
                  <BanknotesIcon style={{ width: 20, display: 'inline', marginRight: 8, color: 'var(--color-primary)' }} />
                  Información Financiera
                </h3>
                {!editMode && (
                  <Button variant="secondary" size="sm" icon={PencilIcon}
                    onClick={() => setEditMode(true)} id="btn-edit-finance">
                    Editar
                  </Button>
                )}
              </div>

              <form onSubmit={handleFinSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label htmlFor="monthly_income">Ingreso mensual ($)</label>
                    <input id="monthly_income" name="monthly_income" type="number" min="0" step="0.01"
                      value={finForm.monthly_income}
                      onChange={e => setFinForm(f => ({ ...f, monthly_income: e.target.value }))}
                      disabled={!editMode} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="savings_goal">Meta de ahorro ($)</label>
                    <input id="savings_goal" name="savings_goal" type="number" min="0" step="0.01"
                      value={finForm.savings_goal}
                      onChange={e => setFinForm(f => ({ ...f, savings_goal: e.target.value }))}
                      disabled={!editMode} placeholder="0.00" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                  <div className="form-group">
                    <label htmlFor="fixed_expenses">Gastos Fijos ($)</label>
                    <input id="fixed_expenses" name="fixed_expenses" type="number" min="0" step="0.01"
                      value={finForm.fixed_expenses}
                      onChange={e => setFinForm(f => ({ ...f, fixed_expenses: e.target.value }))}
                      disabled={!editMode} placeholder="Renta, servicios..." />
                  </div>
                  <div className="form-group">
                    <label htmlFor="variable_expenses">Gastos Variables ($)</label>
                    <input id="variable_expenses" name="variable_expenses" type="number" min="0" step="0.01"
                      value={finForm.variable_expenses}
                      onChange={e => setFinForm(f => ({ ...f, variable_expenses: e.target.value }))}
                      disabled={!editMode} placeholder="Comida, ocio..." />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                  <label htmlFor="income_stability">Estabilidad de Ingresos</label>
                  <select id="income_stability" name="income_stability" 
                    value={finForm.income_stability}
                    onChange={e => setFinForm(f => ({ ...f, income_stability: e.target.value }))}
                    disabled={!editMode}>
                    <option value="stable">Salario Fijo (Estable)</option>
                    <option value="variable">Variable / Ventas</option>
                    <option value="freelance">Freelance / Independiente</option>
                  </select>
                </div>

                {editMode && (
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancelar</Button>
                    <Button type="submit" loading={saving} icon={CheckIcon} id="btn-save-finance">
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Debts */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h3 className="chart-title">
                  <CreditCardIcon style={{ width: 20, display: 'inline', marginRight: 8, color: 'var(--color-warning)' }} />
                  Mis Deudas
                </h3>
                <Button size="sm" icon={PlusIcon} onClick={() => setDebtModal(true)} id="btn-add-debt">
                  Agregar Deuda
                </Button>
              </div>

              {loading ? (
                <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
              ) : debts.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                  <p className="empty-state-text">Sin deudas registradas 🎉</p>
                </div>
              ) : (
                <div className="debts-table-wrap">
                  <table className="debts-table">
                    <thead>
                      <tr>
                        <th>Acreedor</th>
                        <th>Monto</th>
                        <th>Pago Mensual</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debts.map((d, i) => (
                        <tr key={i}>
                          <td>{d.creditor}</td>
                          <td className="debt-amount">{fmt(d.totalAmount)}</td>
                          <td>{fmt(d.monthlyPayment)}</td>
                          <td><span className="badge badge-warning">{d.debtType}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debt Modal */}
      <Modal isOpen={debtModal} onClose={() => setDebtModal(false)} title="Registrar Deuda">
        <form onSubmit={handleDebtSave} id="form-debt" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label htmlFor="debt-creditor">Acreedor (banco, persona, etc.)</label>
            <input id="debt-creditor" name="creditor" placeholder="Ej: Banco Nacional"
              value={debtForm.creditor} onChange={e => setDebtForm(f => ({ ...f, creditor: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="debt-amount">Monto total ($)</label>
              <input id="debt-amount" name="totalAmount" type="number" min="0" step="0.01" placeholder="0.00"
                value={debtForm.totalAmount} onChange={e => setDebtForm(f => ({ ...f, totalAmount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="debt-payment">Pago mensual ($)</label>
              <input id="debt-payment" name="monthlyPayment" type="number" min="0" step="0.01" placeholder="0.00"
                value={debtForm.monthlyPayment} onChange={e => setDebtForm(f => ({ ...f, monthlyPayment: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="debt-type">Tipo de deuda</label>
            <select id="debt-type" value={debtForm.type} onChange={e => setDebtForm(f => ({ ...f, type: e.target.value }))}>
              <option value="credit">Tarjeta de crédito</option>
              <option value="loan">Préstamo personal</option>
              <option value="mortgage">Hipotecario</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setDebtModal(false)}>Cancelar</Button>
            <Button type="submit" loading={savingDebt} id="btn-save-debt">Registrar Deuda</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
