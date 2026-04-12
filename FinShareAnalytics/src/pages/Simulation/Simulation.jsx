import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  BeakerIcon, SparklesIcon, DocumentArrowDownIcon, ClockIcon,
  ExclamationCircleIcon, CheckCircleIcon, PlusIcon,
  ArrowTrendingUpIcon, LightBulbIcon, ChartBarIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import dashboardService from '../../services/dashboardService';
import simulationService from '../../services/simulationService';
import grupoService from '../../services/grupoService';
import './Simulation.css';

const SCENARIOS = [
  { value: 'none', label: 'Escenario Base', desc: 'Tu situación financiera actual sin cambios.' },
  { value: 'job_loss', label: 'Pérdida de Empleo', desc: 'Simula el impacto de quedarte sin ingresos mensuales.' },
  { value: 'income_cut', label: 'Recorte de Ingresos', desc: 'Simula una reducción porcentual en tus entradas.' },
  { value: 'rent_increase', label: 'Aumento de Gastos', desc: 'Simula un incremento en tus gastos fijos (renta, servicios).' },
  { value: 'expense_spike', label: 'Gasto Inesperado', desc: 'Simula un pico de gasto único (emergencia médica, reparación).' },
];

const BACKEND_SCENARIOS = [
  { value: 'job_loss', label: 'Pérdida de Empleo', desc: 'Simula impacto total.' },
  { value: 'income_cut', label: 'Recorte de Ingresos', desc: 'Simula reducción porcentual.' },
  { value: 'rent_increase', label: 'Aumento de Gastos', desc: 'Aumenta gastos fijos.' },
  { value: 'expense_spike', label: 'Gasto Extraordinario', desc: 'Pico de gasto único.' },
  { value: 'member_default', label: 'Impago de Miembro', desc: 'Simula que alguien no paga (Requiere Grupo).' },
];

const EMPTY_FORM = {
  scenarioType: 'income_cut',
  description: '',
  targetGroupId: '',
  cut_percent: '0.20',
  increase_amount: '',
  spike_amount: '',
};

export default function Simulation() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewResult, setPreviewResult] = useState(null);

  const [baseline, setBaseline] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    debt: 0
  });

  // State for LIVE parameters
  const [scenario, setScenario] = useState('none');
  const [params, setParams] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    debt: 0,
    months: 12,
    emergencyMonths: 6,
    // Scenario specific
    cutPercent: 20,
    increaseAmount: 0,
    spikeAmount: 0
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [dashData, grpsData] = await Promise.all([
          dashboardService.getPersonal(),
          grupoService.obtenerTodos()
        ]);

        const b = {
          income: dashData.finance?.monthlyIncome || 0,
          expenses: (dashData.finance?.fixedExpenses || 0) + (dashData.finance?.variableExpenses || 0),
          savings: dashData.finance?.savings || 0,
          debt: dashData.debtsSummary?.totalMonthlyPayment || 0
        };
        setBaseline(b);
        setParams(prev => ({ ...prev, ...b }));
        setGrupos(grpsData || []);
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Real-time calculation logic (Live View)
  const projectionData = useMemo(() => {
    let currentIncome = Number(params.income);
    let currentExpenses = Number(params.expenses);
    let currentSavings = Number(params.savings);
    const currentDebt = Number(params.debt);
    const months = Number(params.months);

    if (scenario === 'job_loss') currentIncome = 0;
    if (scenario === 'income_cut') currentIncome *= (1 - (params.cutPercent / 100));
    if (scenario === 'rent_increase') currentExpenses += Number(params.increaseAmount);

    const netFlow = currentIncome - currentExpenses - currentDebt;
    const data = [];
    let balance = currentSavings;

    data.push({ month: 'Mes 0', balance });
    if (scenario === 'expense_spike') balance -= Number(params.spikeAmount);

    for (let i = 1; i <= months; i++) {
      balance += netFlow;
      data.push({ month: `Mes ${i}`, balance: Math.max(0, balance) });
    }

    const finalBalance = balance;
    const emergencyFundGoal = currentExpenses * params.emergencyMonths;
    const isHealthy = finalBalance >= emergencyFundGoal;

    return { data, netFlow, finalBalance, emergencyFundGoal, isHealthy };
  }, [params, scenario]);

  // Phase 1: Call Preview Endpoint
  const handleBackendPreview = async () => {
    setCalculating(true);
    try {
      const backendParams = {};
      if (form.scenarioType === 'income_cut') backendParams.cut_percent = Number(form.cut_percent);
      if (form.scenarioType === 'rent_increase') backendParams.increase_amount = Number(form.increase_amount);
      if (form.scenarioType === 'expense_spike') backendParams.spike_amount = Number(form.spike_amount);

      const payload = {
        scenarioType: form.scenarioType,
        description: form.description,
        targetGroupId: form.targetGroupId || null,
        parameters: backendParams,
      };

      const res = await simulationService.preview(payload);
      setPreviewResult(res.result || res); // Backend returns sim_doc or data object
    } catch (err) {
      alert(err.response?.data?.error || 'Error al ejecutar la simulación.');
    } finally { setCalculating(false); }
  };

  // Phase 2: Confirm and Save to History
  const handleBackendSave = async () => {
    setSaving(true);
    try {
      const backendParams = {};
      if (form.scenarioType === 'income_cut') backendParams.cut_percent = Number(form.cut_percent);
      if (form.scenarioType === 'rent_increase') backendParams.increase_amount = Number(form.increase_amount);
      if (form.scenarioType === 'expense_spike') backendParams.spike_amount = Number(form.spike_amount);

      const payload = {
        scenarioType: form.scenarioType,
        description: form.description,
        targetGroupId: form.targetGroupId || null,
        parameters: backendParams,
      };

      await simulationService.create(payload);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setPreviewResult(null);
      alert('Simulación guardada en el historial con éxito.');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la simulación.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <AppLayout>
      <div className="page-container">
        <div className="skeleton" style={{ height: 60, marginBottom: 20 }} />
        <div className="content-grid-2">
          <div className="skeleton" style={{ height: 500 }} />
          <div className="skeleton" style={{ height: 500 }} />
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header sim-page-header">
          <div>
            <h1 className="page-title">Simulador de Futuro</h1>
            <p className="page-subtitle">Proyecta tu estabilidad financiera bajo diferentes escenarios</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/simulacion/historial">
              <Button variant="secondary" icon={ClockIcon}>Historial</Button>
            </Link>
            <Button icon={PlusIcon} onClick={() => { setPreviewResult(null); setModalOpen(true); }}>
              Simulación Rápida (Preview)
            </Button>
          </div>
        </div>

        <div className="sim-grid">
          {/* Left Panel: Parameters (LIVE ONLY) */}
          <aside className="sim-parameters-card animate-fade-in">
            <h3 className="sim-section-title">Parámetros en Vivo</h3>
            <div className="form-group">
              <label>Escenario Visual</label>
              <select value={scenario} onChange={e => setScenario(e.target.value)} className="sim-select">
                {SCENARIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <p className="sim-help-text">{SCENARIOS.find(s => s.value === scenario)?.desc}</p>
            </div>

            <div className="divider" />
            <div className="sim-inputs-grid">
              <div className="form-group"><label>Ingreso ($)</label><input type="number" value={params.income} onChange={e => setParams({ ...params, income: e.target.value })} /></div>
              <div className="form-group"><label>Gasto ($)</label><input type="number" value={params.expenses} onChange={e => setParams({ ...params, expenses: e.target.value })} /></div>
              <div className="form-group"><label>Ahorro ($)</label><input type="number" value={params.savings} onChange={e => setParams({ ...params, savings: e.target.value })} /></div>
              <div className="form-group"><label>Deuda ($)</label><input type="number" value={params.debt} onChange={e => setParams({ ...params, debt: e.target.value })} /></div>
            </div>

            <div className="divider" />
            {scenario === 'income_cut' && (
              <div className="form-group animate-slide-in">
                <label>Recorte: {params.cutPercent}%</label>
                <input type="range" min="0" max="100" value={params.cutPercent} onChange={e => setParams({ ...params, cutPercent: e.target.value })} className="sim-slider" />
              </div>
            )}
            {scenario === 'rent_increase' && (
              <div className="form-group animate-slide-in">
                <label>Aumento de Gastos ($)</label>
                <input type="number" value={params.increaseAmount} onChange={e => setParams({ ...params, increaseAmount: e.target.value })} />
              </div>
            )}
            {scenario === 'expense_spike' && (
              <div className="form-group animate-slide-in">
                <label>Gasto Extra ($)</label>
                <input type="number" value={params.spikeAmount} onChange={e => setParams({ ...params, spikeAmount: e.target.value })} />
              </div>
            )}

            <div className="form-group">
              <label>Fondo Emergencia: {params.emergencyMonths} meses</label>
              <input type="range" min="1" max="12" value={params.emergencyMonths} onChange={e => setParams({ ...params, emergencyMonths: e.target.value })} className="sim-slider" />
            </div>
            <div className="form-group">
              <label>Proyección: {params.months} meses</label>
              <input type="range" min="3" max="36" value={params.months} onChange={e => setParams({ ...params, months: e.target.value })} className="sim-slider" />
            </div>
          </aside>

          {/* Right Panel: Results */}
          <main className="sim-results-panel">
            <div className={`sim-alert ${projectionData.isHealthy ? 'healthy' : 'critical'} animate-fade-in`}>
              <div className="sim-alert-icon">{projectionData.isHealthy ? <CheckCircleIcon /> : <ExclamationCircleIcon />}</div>
              <div className="sim-alert-content">
                <h4 className="sim-alert-title">{projectionData.isHealthy ? 'Proyección Saludable' : 'Riesgo Detectado'}</h4>
                <p className="sim-alert-desc">
                  {projectionData.isHealthy ? `Tu balance final ($${Math.round(projectionData.finalBalance).toLocaleString()}) supera la meta.` : `Balance por debajo de la meta ($${Math.round(projectionData.emergencyFundGoal).toLocaleString()}).`}
                </p>
              </div>
            </div>

            <div className="sim-kpi-grid">
              <div className="sim-kpi-card">
                <span className="kpi-label">Flujo Mensual</span>
                <span className={`kpi-value ${projectionData.netFlow >= 0 ? 'pos' : 'neg'}`}>${Math.round(projectionData.netFlow).toLocaleString()}</span>
              </div>
              <div className="sim-kpi-card">
                <span className="kpi-label">Balance Final</span>
                <span className="kpi-value">${Math.round(projectionData.finalBalance).toLocaleString()}</span>
              </div>
              <div className="sim-kpi-card">
                <span className="kpi-label">Meta Reserva</span>
                <span className="kpi-value">${Math.round(projectionData.emergencyFundGoal).toLocaleString()}</span>
              </div>
            </div>

            <div className="card sim-chart-card animate-fade-in">
              <div className="chart-header">
                <h3 className="chart-title">Visualización de Balance</h3>
                <div className="chart-legend">
                  <span className="legend-item"><span className="dot" style={{ background: 'var(--color-primary)' }} /> Balance</span>
                  <span className="legend-item"><span className="dot" style={{ background: '#F59E0B', borderStyle: 'dashed' }} /> Fondo Meta</span>
                </div>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart data={projectionData.data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }} formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Balance']} />
                    <ReferenceLine y={projectionData.emergencyFundGoal} stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2} />
                    <Area type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Improved Modal with Preview Phase */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Simulación Rápida de Escenario" size="xl">
        <div className="modal-quick-sim-content">
          <div className="form-sim">
            <h4 style={{ fontWeight: 800, marginBottom: 16 }}>1. Configura el Escenario</h4>
            <div className="form-group">
              <label>Tipo de Escenario</label>
              <select value={form.scenarioType} onChange={e => { setForm({ ...form, scenarioType: e.target.value }); setPreviewResult(null); }} className="sim-select">
                {BACKEND_SCENARIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {form.scenarioType === 'income_cut' && (
                <div className="form-group">
                  <label>Recorte porcentual (0.1 - 0.9)</label>
                  <input type="number" step="0.1" value={form.cut_percent} onChange={e => { setForm({ ...form, cut_percent: e.target.value }); setPreviewResult(null); }} />
                </div>
              )}
              {form.scenarioType === 'rent_increase' && (
                <div className="form-group">
                  <label>Aumento en renta ($)</label>
                  <input type="number" value={form.increase_amount} onChange={e => { setForm({ ...form, increase_amount: e.target.value }); setPreviewResult(null); }} />
                </div>
              )}
              {form.scenarioType === 'expense_spike' && (
                <div className="form-group">
                  <label>Monto extra ($)</label>
                  <input type="number" value={form.spike_amount} onChange={e => { setForm({ ...form, spike_amount: e.target.value }); setPreviewResult(null); }} />
                </div>
              )}
              <div className="form-group">
                <label>Grupo (opcional)</label>
                <select value={form.targetGroupId} onChange={e => { setForm({ ...form, targetGroupId: e.target.value }); setPreviewResult(null); }} className="sim-select">
                  <option value="">Ninguno</option>
                  {grupos.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <Button type="button" onClick={handleBackendPreview} loading={calculating} icon={ArrowPathIcon} fullWidth style={{ marginTop: 10 }}>
              Realizar Simulación Rápida
            </Button>
          </div>

          {previewResult && (
            <div className="preview-results-panel animate-slide-in">
              <h4 style={{ fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ChartBarIcon style={{ width: 22, color: 'var(--color-primary)' }} />
                2. Resultados del Análisis
              </h4>

              <div className="preview-stats-grid">
                <div className="p-stat-card">
                  <span className="p-label">Impacto en Riesgo</span>
                  <span className={`p-value ${previewResult.riskDelta > 0 ? 'bad' : 'good'}`}>
                    {previewResult.riskDelta > 0 ? '+' : ''}{previewResult.riskDelta} pts
                  </span>
                </div>
                <div className="p-stat-card">
                  <span className="p-label">Var. Estabilidad</span>
                  <span className={`p-value ${previewResult.stabilityDelta >= 0 ? 'good' : 'bad'}`}>
                    {previewResult.stabilityDelta > 0 ? '+' : ''}{(previewResult.stabilityDelta * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="preview-recommendation">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBotom: 8 }}>
                  <LightBulbIcon style={{ width: 20, color: '#F59E0B' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Insight Estratégico AI</span>
                </div>
                <p className="p-rec-text">{previewResult.recommendation}</p>
              </div>

              <div style={{ marginTop: 24, padding: 16, borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 12, textAlign: 'left' }}>
                  * Si este resultado te parece útil, puedes guardarlo permanentemente en tu historial para consultas futuras.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => setPreviewResult(null)}>Descartar</Button>
                  <Button icon={DocumentArrowDownIcon} onClick={handleBackendSave} loading={saving}>
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
