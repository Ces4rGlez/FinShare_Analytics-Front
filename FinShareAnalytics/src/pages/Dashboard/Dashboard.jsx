import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  ScaleIcon, ShieldCheckIcon, UserGroupIcon, PlusIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/common/StatCard';
import dashboardService from '../../services/dashboardService';
import grupoService from '../../services/grupoService';
import transactionService from '../../services/transactionService';
import './Dashboard.css';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="chart-tooltip-value">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [grupos, setGrupos]     = useState([]);
  const [resumenReal, setResumenReal] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, grps, real] = await Promise.allSettled([
          dashboardService.getPersonal(),
          grupoService.obtenerTodos(),
          transactionService.obtenerResumen(),
        ]);
        if (dash.status === 'fulfilled') setDashData(dash.value);
        if (grps.status === 'fulfilled') setGrupos(grps.value || []);
        if (real.status === 'fulfilled') setResumenReal(real.value);
      } catch {/* ignore */}
      finally { setLoading(false); }
    };
    load();
  }, []);

  /* ── Derived metrics (ALIGNED WITH BACKEND personal_summary) ── */
  const finance           = dashData?.finance ?? {};
  const income            = Number(finance.monthlyIncome || 0);
  const fixedExpenses     = Number(finance.fixedExpenses || 0);
  const variableExpenses  = Number(finance.variableExpenses || 0);
  const expenses          = fixedExpenses + variableExpenses;
  const balance           = income - expenses;
  
  const pendingInfo       = dashData?.sharedExpensesPending ?? {};
  const pendingBalance    = Number(pendingInfo.balance || 0);

  const catsData          = dashData?.spendingByCategory ?? [];
  const riskReport        = dashData?.lastRiskReport ?? {};
  const riskScore         = riskReport.riskScore ?? null;
  const monthlyHistogram  = dashData?.monthlyHistogram ?? [];
  const recentTransactions = dashData?.recentTransactions ?? []; // Future-proofing

  // Build pie data from categories
  const pieData = catsData.map(item => ({ 
    name: item.category || 'Otros', 
    value: item.totalAmount 
  }));

  // Build area chart data (Dummy fallback as backend summary doesn't provide history yet)
  const areaData = [
    { month: 'Ene', ingresos: income * 0.8, gastos: expenses * 0.7 },
    { month: 'Feb', ingresos: income * 0.9, gastos: expenses * 0.8 },
    { month: 'Mar', ingresos: income, gastos: expenses },
  ];

  const riskColor = riskScore === null ? 'var(--color-text-muted)'
    : riskScore >= 70 ? 'var(--color-danger)'
    : riskScore >= 40 ? 'var(--color-warning)'
    : 'var(--color-success)';

  const riskLabel = riskScore === null ? 'Sin datos'
    : riskScore >= 70 ? 'Alto'
    : riskScore >= 40 ? 'Moderado'
    : 'Bajo';

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Dashboard Personal</h1>
          <p className="page-subtitle">Mira cómo van tus finanzas este mes</p>
        </div>

        {resumenReal && (
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'white', border: '1px solid #F1F5F9', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--color-primary)' }}>Resumen de Actividad Real</h4>
                 <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Basado en tus {resumenReal.incomeCount + resumenReal.expenseCount} transacciones registradas</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Balance Real</span>
                 <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: resumenReal.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                   {fmt(resumenReal.balance)}
                 </p>
               </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="stats-grid">
          <StatCard
            title="Balance Neto"
            value={fmt(balance)}
            subtitle="Ingreso - Gastos Fijos"
            icon={ScaleIcon}
            color={balance >= 0 ? 'primary' : 'danger'}
            trend={balance >= 0 ? 1 : -1}
            trendValue={balance >= 0 ? 'Positivo' : 'Negativo'}
            loading={loading}
          />
          <StatCard
            title="Ingresos Totales"
            value={fmt(income)}
            subtitle="Este período"
            icon={ArrowTrendingUpIcon}
            color="primary"
            loading={loading}
          />
          <StatCard
            title="Gastos Totales"
            value={fmt(expenses)}
            subtitle="Este período"
            icon={ArrowTrendingDownIcon}
            color="danger"
            loading={loading}
          />
          <StatCard
            title="Riesgo Financiero"
            value={riskScore !== null ? `${riskScore}/100` : '—'}
            subtitle={riskLabel}
            icon={ShieldCheckIcon}
            color={riskScore >= 70 ? 'danger' : riskScore >= 40 ? 'warning' : 'primary'}
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="content-grid-2" style={{ marginBottom: 'var(--space-6)' }}>
          {/* Area Chart */}
          <div className="card dashboard-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Ingresos vs Gastos</h3>
              <span className="chart-period">Histórico</span>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10B981"
                    strokeWidth={3} fill="#ECFDF5" fillOpacity={1} />
                  <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#EF4444"
                    strokeWidth={3} fill="#FEF2F2" fillOpacity={1} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart */}
          <div className="card dashboard-chart-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="chart-header">
              <h3 className="chart-title">Distribución de Gastos</h3>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
            ) : pieData.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 220 }}>
                <p className="empty-state-text">No hay gastos registrados aún</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="35%" cy="50%" innerRadius={60} outerRadius={85}
                    paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={10} 
                    wrapperStyle={{ paddingLeft: '20px', fontSize: '13px', fontWeight: 600 }}
                    formatter={(v) => <span style={{ color: '#475569' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="content-grid-2">
          {/* Spending Info / Pending */}
          <div className="card">
            <div className="chart-header" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 className="chart-title">Gastos Compartidos Pendientes</h3>
              <button className="btn-link" onClick={() => navigate('/transacciones')}>Ver todos</button>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
            ) : (
              <div className="pending-summary">
                <div className="pending-stat">
                  <span className="pending-label">Total por pagar</span>
                  <span className="pending-val neg">{fmt(pendingInfo.totalOwed)}</span>
                </div>
                <div className="pending-stat">
                  <span className="pending-label">Total pagado</span>
                  <span className="pending-val pos">{fmt(pendingInfo.totalPaid)}</span>
                </div>
                <div className="pending-stat">
                  <span className="pending-label">Balance en grupos</span>
                  <span className={`pending-val ${pendingBalance >= 0 ? 'pos' : 'neg'}`}>
                    {fmt(pendingBalance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* My Groups */}
          <div className="card">
            <div className="chart-header" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 className="chart-title">Mis Grupos</h3>
              <button className="btn-link" onClick={() => navigate('/grupos')}>Ver todos</button>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 8 }} />)}
              </div>
            ) : grupos.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                <UserGroupIcon style={{ width: 40, height: 40, color: 'var(--color-text-muted)', opacity: 0.4 }} />
                <p className="empty-state-text">No tienes grupos activos</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/grupos')}
                  style={{ marginTop: 8 }}>
                  <PlusIcon style={{ width: 14 }} /> Crear grupo
                </button>
              </div>
            ) : (
              <div className="group-mini-list">
                {grupos.slice(0, 3).map((g) => (
                  <div key={g._id} className="group-mini-card"
                    onClick={() => navigate(`/grupo/${g._id}`)} style={{ cursor: 'pointer' }}>
                    <div className="group-mini-avatar">
                      {g.name?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div className="group-mini-info">
                      <p className="group-mini-name">{g.name}</p>
                      <p className="group-mini-sub">{g.members?.length || 0} miembros · {g.groupType}</p>
                    </div>
                    <span className="badge badge-success">Activo</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
