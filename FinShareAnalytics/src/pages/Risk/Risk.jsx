import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  ShieldCheckIcon, ShieldExclamationIcon, ExclamationTriangleIcon,
  ArrowPathIcon, LightBulbIcon, ClockIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import riskService from '../../services/riskService';
import './Risk.css';

const getRiskLevelConfig = (level, score) => {
  const normalizedLevel = level?.toLowerCase() || '';
  
  if (score === null || score === undefined) {
    return { label: 'Sin datos', color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' };
  }

  // Align with backend thresholds: < 35 low, < 65 medium, else high
  if (normalizedLevel === 'high' || score >= 65) {
    return { label: 'Riesgo Alto', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' };
  }
  if (normalizedLevel === 'medium' || score >= 35) {
    return { label: 'Riesgo Moderado', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
  }
  return { label: 'Riesgo Bajo', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
};

const generateRecommendations = (report) => {
  if (!report) return [];
  const recs = [];
  
  if (report.debtIndex > 0.35) {
    recs.push({
      title: 'Reducir Nivel de Deuda',
      description: 'Tu índice de deuda supera el 35%. Prioriza el pago de préstamos con mayores tasas de interés.'
    });
  }
  
  if (report.savingsCapacity < 0.15) {
    recs.push({
      title: 'Optimizar Gastos Variables',
      description: 'Tu capacidad de ahorro es menor al 15%. Revisa gastos no esenciales para mejorar tu margen mensual.'
    });
  }
  
  if (report.emergencyFundMonths < 3) {
    recs.push({
      title: 'Construir Fondo de Reserva',
      description: 'Tu fondo actual cubre menos de 3 meses. Intenta ahorrar hasta cubrir al menos 6 meses de gastos fijos.'
    });
  } else if (report.emergencyFundMonths >= 6 && report.riskLevel === 'low') {
    recs.push({
      title: 'Considera Invertir',
      description: 'Tienes un colchón financiero sólido. Es un buen momento para buscar opciones de inversión de bajo riesgo.'
    });
  }

  if (recs.length === 0) {
    recs.push({
      title: 'Mantener Estabilidad',
      description: 'Tus indicadores están en rangos saludables. Sigue monitoreando tus finanzas mensualmente.'
    });
  }
  
  return recs;
};

export default function Risk() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await riskService.getReport();
      setReport(data);
    } catch (err) { 
      console.error("Error fetching report:", err);
      setReport(null); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await riskService.analyze();
      await fetchReport();
    } catch { alert('Error al analizar. Asegúrate de tener transacciones registradas.'); }
    finally { setAnalyzing(false); }
  };

  const score = report?.riskScore ?? null;
  const level = getRiskLevelConfig(report?.riskLevel, score);
  
  const factors = report ? [
    { name: 'Índice Deuda', value: Math.round(report.debtIndex * 100), real: `${(report.debtIndex * 100).toFixed(1)}%` },
    { name: 'Cap. Ahorro', value: Math.max(0, Math.round(report.savingsCapacity * 100)), real: `${(report.savingsCapacity * 100).toFixed(1)}%` },
    { name: 'Fondo Emerg.', value: Math.min(Math.round(report.emergencyFundMonths * 16.6), 100), real: `${report.emergencyFundMonths} meses` }
  ] : [];

  const recommendations = generateRecommendations(report);

  const barData = factors.map(f => ({
    name: f.name,
    value: f.value,
    real: f.real
  }));

  const radarData = report ? [
    { subject: 'Control Deuda', A: Math.max(0, 100 - (report.debtIndex * 100)), fullMark: 100 },
    { subject: 'Ahorro', A: Math.min(100, Math.max(0, report.savingsCapacity * 100 * 2)), fullMark: 100 }, // Scaled slightly to look balanced
    { subject: 'Fondo Emerg.', A: Math.min(100, (report.emergencyFundMonths / 6) * 100), fullMark: 100 }
  ] : [];

  const gaugeRotation = score !== null ? (score / 100) * 180 - 90 : -90;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header risk-page-header">
          <div>
            <h1 className="page-title">Análisis de Riesgo</h1>
            <div className="page-subtitle-container">
              <p className="page-subtitle">Evaluación de tu estabilidad financiera</p>
              {report?.generatedAt && (
                <>
                  <span className="hide-mobile" style={{ color: 'var(--color-border)' }}>•</span>
                  <div className="risk-analysis-date">
                    <ClockIcon style={{ width: 14 }} />
                    <span>Último análisis: {formatDate(report.generatedAt)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            icon={ArrowPathIcon}
            onClick={handleAnalyze}
            loading={analyzing}
            id="btn-analyze-risk"
          >
            Analizar Ahora
          </Button>
        </div>

        {loading ? (
          <div className="risk-loading-grid">
            <div className="skeleton" style={{ height: 380, borderRadius: 24 }} />
            <div className="skeleton" style={{ height: 380, borderRadius: 24 }} />
          </div>
        ) : (
          <>
            <div className="content-grid-2" style={{ marginBottom: 'var(--space-8)' }}>
              {/* Risk Score Card */}
              <div className="card risk-score-card animate-fade-in">
                <h3 className="chart-title">Estado de Riesgo General</h3>
                <div className="gauge-container">
                  <svg viewBox="0 0 200 120" className="gauge-svg">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
                      stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
                    {score !== null && (
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
                        stroke={level.color} strokeWidth="14" strokeLinecap="round"
                        strokeDasharray={`${score * 2.51} 251`} opacity="1" />
                    )}
                    <g transform={`translate(100, 100) rotate(${gaugeRotation})`}>
                      <line x1="0" y1="0" x2="0" y2="-65"
                        stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="0" cy="0" r="6" fill="#0F172A" />
                      <circle cx="0" cy="0" r="3" fill="white" />
                    </g>
                  </svg>

                  <div className="gauge-score-display">
                    <p className="gauge-value" style={{ color: level.color }}>
                      {score !== null ? `${Math.round(score)}%` : '—'}
                    </p>
                    <span className="gauge-label" style={{ backgroundColor: level.bg, color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                </div>

                {score === null && (
                  <p className="risk-no-data">
                    Haz clic en "Analizar Ahora" para obtener tu evaluación de riesgo financiero.
                  </p>
                )}
              </div>

              {/* Bar Chart — Factors */}
              <div className="card factors-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="chart-title">Desglose de Indicadores</h3>
                {barData.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                    <ExclamationTriangleIcon style={{ width: 40, height: 40, color: 'var(--color-text-muted)', opacity: 0.4 }} />
                    <p className="empty-state-text">Realiza un análisis para ver los factores</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                        axisLine={false} tickLine={false} width={100} />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                        formatter={(v, name, props) => [props.payload.real, 'Valor Real']}
                      />
                      <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={16}>
                        {barData.map((entry, i) => (
                          <Cell key={i}
                            fill={entry.value >= 65 ? '#EF4444' :
                                  entry.value >= 35 ? '#F59E0B' : '#10B981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Row: Recommendations & Radar Chart */}
            {(recommendations.length > 0 || score !== null) && (
              <div className="content-grid-2" style={{ alignItems: 'flex-start' }}>
                
                {/* Left: Recommendations */}
                <div>
                  <h3 className="recommendations-title" style={{ margin: '0 0 24px 0' }}>
                    <LightBulbIcon style={{ width: 24, height: 24, color: '#F59E0B' }} />
                    Recomendaciones Personalizadas
                  </h3>
                  <div className="recommendations-list">
                    {recommendations.map((r, i) => (
                      <div key={i} className="recommendation-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, marginBottom: 16 }}>
                        <div className="rec-icon">
                          <LightBulbIcon style={{ width: 24 }} />
                        </div>
                        <div className="rec-content">
                          <p className="rec-title">{r.title}</p>
                          <p className="rec-desc">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Radar Chart Visualization */}
                <div>
                  <h3 className="recommendations-title" style={{ margin: '0 0 24px 0' }}>
                    <ShieldCheckIcon style={{ width: 24, height: 24, color: '#10B981' }} />
                    Equilibrio Financiero
                  </h3>
                  <div className="card animate-fade-in" style={{ padding: 32, background: 'white', borderRadius: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', textAlign: 'center', marginBottom: 16 }}>
                      Representación de la salud de tus tres pilares: Deuda, Ahorro y Emergencias. Un triángulo más grande y simétrico indica mayor estabilidad.
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Salud Financiera" dataKey="A" stroke="#10B981" strokeWidth={2} fill="#ECFDF5" fillOpacity={0.8} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* No report yet */}
            {!report && !loading && (
              <div className="card empty-state" style={{ minHeight: 300 }}>
                <ShieldExclamationIcon style={{ width: 64, height: 64, color: 'var(--color-text-muted)', opacity: 0.3 }} />
                <p className="empty-state-title">Sin análisis de riesgo</p>
                <p className="empty-state-text">
                  Presiona el botón "Analizar Ahora" para evaluar tu situación financiera actual.
                </p>
                <Button icon={ArrowPathIcon} onClick={handleAnalyze} loading={analyzing} id="btn-analyze-risk-empty">
                  Analizar Ahora
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
