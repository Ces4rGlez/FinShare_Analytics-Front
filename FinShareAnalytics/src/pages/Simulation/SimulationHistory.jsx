import { useEffect, useState } from 'react';
import {
  BeakerIcon, TrashIcon, ArrowLeftIcon, SparklesIcon, PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import simulationService from '../../services/simulationService';
import './SimulationHistory.css';

const SCENARIOS = [
  { value: 'job_loss',       label: 'Pérdida de Empleo' },
  { value: 'income_cut',     label: 'Recorte de Ingresos' },
  { value: 'rent_increase',  label: 'Aumento de Renta' },
  { value: 'expense_spike',  label: 'Gasto Extraordinario' },
  { value: 'member_default', label: 'Impago de Miembro' },
];

export default function SimulationHistory() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading]         = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen]     = useState(false);
  const [activeSim, setActiveSim]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await simulationService.list();
      const items = Array.isArray(res) ? res : (res.items || []);
      setSimulations(items);
    } catch { 
      setSimulations([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar este análisis?')) return;
    try {
      await simulationService.delete(id);
      load();
    } catch {
      alert('Error al eliminar la simulación.');
    }
  };

  const handleCardClick = (sim) => {
    setActiveSim(sim);
    setModalOpen(true);
  };

  // Safe checks for the Modal data
  const result = activeSim?.result || {};
  const rDelta = Number(result.riskDelta || 0);
  const sDelta = Number(result.stabilityDelta || 0);
  const cProb  = Number(result.conflictProbability || 0);
  const rec    = result.recommendation || 'No hay recomendaciones adicionales.';

  return (
    <AppLayout>
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Link to="/simulacion" className="btn-back" style={{ marginBottom: 0, padding: '6px 12px' }}>
                <ArrowLeftIcon style={{ width: 16 }} /> Volver
              </Link>
            </div>
            <h1 className="page-title">Historial de Simulaciones</h1>
            <p className="page-subtitle">Consulta tus análisis de riesgo y proyecciones pasadas</p>
          </div>
        </div>

        {loading ? (
          <div className="history-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20 }} />)}
          </div>
        ) : simulations.length === 0 ? (
          <div className="empty-state card" style={{ padding: '64px', borderStyle: 'dashed' }}>
            <PresentationChartLineIcon style={{ width: 64, color: '#CBD5E1', marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Sin simulaciones</h3>
            <p style={{ color: '#64748B', maxWidth: 400, textAlign: 'center', marginTop: 8 }}>
              Tus escenarios evaluados y guardados aparecerán aquí para que puedas analizarlos después.
            </p>
            <Link to="/simulacion" style={{ marginTop: 24 }}>
              <Button icon={BeakerIcon}>Ir al motor de simulación</Button>
            </Link>
          </div>
        ) : (
          <div className="history-grid">
            {simulations.map(s => {
              const rD = Number(s.result?.riskDelta || 0);
              const label = SCENARIOS.find(x => x.value === s.scenarioType)?.label || s.scenarioType;
              return (
                <div key={s._id} className="history-card" onClick={() => handleCardClick(s)}>
                  <div>
                    <div className="hc-top">
                      <div className="hc-icon-wrapper">
                        <BeakerIcon style={{ width: 24 }} />
                      </div>
                      <span className="hc-date">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="hc-title">{label}</h3>
                    <p className="hc-desc">{s.description || 'Simulación sin nota adicional'}</p>
                  </div>

                  <div className="hc-footer">
                    <span className={`hc-impact-badge ${rD > 0 ? 'impact-neg' : rD < 0 ? 'impact-pos' : 'impact-neu'}`}>
                      {rD > 0 ? `+${rD}` : rD} pts de riesgo
                    </span>
                    <button className="hc-delete-btn" onClick={(e) => handleDelete(e, s._id)} title="Eliminar del historial">
                      <TrashIcon style={{ width: 16 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="" maxWidth="600px">
        {activeSim && (
          <div className="modal-sim-content">
            <div className="ms-header">
              <h2 className="ms-title">{SCENARIOS.find(x => x.value === activeSim.scenarioType)?.label}</h2>
              <p className="ms-date">Analizado el {new Date(activeSim.createdAt).toLocaleDateString()}</p>
              {activeSim.description && (
                <p style={{ fontStyle: 'italic', color: '#64748B', marginTop: 8 }}>"{activeSim.description}"</p>
              )}
            </div>

            <div className="ms-metrics-grid">
              <div className="ms-metric-card">
                <span className="ms-m-label">Impacto en Riesgo</span>
                <span className={`ms-m-val ${rDelta > 10 ? 'danger' : rDelta > 0 ? 'warning' : 'success'}`}>
                  {rDelta > 0 ? `+${rDelta}` : rDelta} pts
                </span>
              </div>
              <div className="ms-metric-card">
                <span className="ms-m-label">Variación Estabilidad</span>
                <span className={`ms-m-val ${sDelta < 0 ? 'danger' : 'success'}`}>
                  {sDelta > 0 ? '+' : ''}{(sDelta * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="ms-insight-box">
              <h4 className="ms-insight-title">
                <SparklesIcon style={{ width: 20 }} /> Insight de IA
              </h4>
              <p className="ms-insight-text">{rec}</p>
            </div>

            <div className="ms-params-box">
              <h5 className="ms-params-title">Parámetros Evaluados</h5>
              <div className="ms-params-grid">
                {Object.entries(activeSim.parameters || {}).map(([key, val]) => (
                  <div key={key} className="ms-param-item">
                    <span className="key">{key}</span>
                    <span className="val">{val}</span>
                  </div>
                ))}
                {Object.keys(activeSim.parameters || {}).length === 0 && (
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Sin parámetros adicionales</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
