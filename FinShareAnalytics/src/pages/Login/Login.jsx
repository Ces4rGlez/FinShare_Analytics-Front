import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChartBarIcon, EyeIcon, EyeSlashIcon, PresentationChartLineIcon, UserGroupIcon, ShieldCheckIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', monthly_income: '',
  });

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        // Aligned with Backend RegisterSchema: fullName, email, password
        await register({
          fullName: form.name,
          email: form.email,
          password: form.password,
        });

      }
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Ocurrió un error. Verifica tus datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = pwdStrength(form.password);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-content animate-fade-in">
          <div className="login-hero-logo">
            <ChartBarIcon style={{ width: 110, height: 110, color: 'white' }} />
          </div>
          <h1 className="login-hero-title">FinShare Analytics</h1>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-box">
          <div className="login-tabs">
            <button id="tab-login" className={`login-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}>
              Iniciar Sesión
            </button>
            <button id="tab-register" className={`login-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}>
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form" id="form-auth" noValidate>
            {tab === 'register' && (
              <div className="form-group animate-fade-in">
                <label htmlFor="name">Nombre completo</label>
                <input id="name" name="name" type="text" placeholder="Tu nombre completo"
                  value={form.name} onChange={handleChange} required autoComplete="name" />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" placeholder="correo@ejemplo.com"
                value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-password-wrap">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={handleChange}
                  required autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" className="input-eye-btn" onClick={() => setShowPwd(s => !s)}>
                  {showPwd ? <EyeSlashIcon style={{ width: 18 }} /> : <EyeIcon style={{ width: 18 }} />}
                </button>
              </div>
              {tab === 'register' && form.password && (
                <div className="pwd-strength-wrap animate-fade-in">
                  <div className="pwd-strength-bars">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="pwd-strength-bar"
                        style={{ background: n <= strength ? strengthColors[strength] : 'var(--color-surface-3)' }} />
                    ))}
                  </div>
                  <span className="pwd-strength-label" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {tab === 'register' && (
              <div className="form-group animate-fade-in">
                <label htmlFor="monthly_income">Ingreso mensual (opcional)</label>
                <input id="monthly_income" name="monthly_income" type="number"
                  placeholder="0.00" value={form.monthly_income} onChange={handleChange}
                  min="0" step="0.01" />
              </div>
            )}

            {error && (
              <div className="login-error animate-fade-in" role="alert">
                <ExclamationTriangleIcon style={{ width: 16, marginRight: 8, display: 'inline' }} />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} id="btn-submit-auth">
              {tab === 'login' ? 'Entrar a mi cuenta' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="login-switch">
            {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button className="login-switch-btn"
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}>
              {tab === 'login' ? 'Regístrate gratis' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}