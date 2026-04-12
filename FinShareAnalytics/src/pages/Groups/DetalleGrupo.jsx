import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grupoService from '../../services/grupoService';
import expenseService from '../../services/expenseService';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeftIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import './DetalleGrupo.css';
import RegistrarGastoForm from '../../components/forms/RegistrarGastoForm';
import AppLayout from '../../components/layout/AppLayout';

function DetalleGrupo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [grupo, setGrupo] = useState(null);
    const [summary, setSummary] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Estados para formularios y modales
    const [mostrarInputInvitar, setMostrarInputInvitar] = useState(false);
    const [emailInvitar, setEmailInvitar] = useState('');
    const [invitando, setInvitando] = useState(false);

    const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
    const [gastoAEditar, setGastoAEditar] = useState(null);
    const [recalculando, setRecalculando] = useState(false);
    
    // Nuevo para Desglose
    const [desglose, setDesglose] = useState([]);
    const [mostrarDesglose, setMostrarDesglose] = useState(false);
    const [cargandoDesglose, setCargandoDesglose] = useState(false);

    // Cargar información completa del grupo y su resumen analítico
    const cargarTodo = async () => {
        setCargando(true);
        try {
            const [dataGrupo, dataSummary] = await Promise.all([
                grupoService.obtenerPorId(id),
                dashboardService.getGroupSummary(id)
            ]);
            setGrupo(dataGrupo);
            setSummary(dataSummary);
            setGastos(dataSummary.recentExpenses || []);
        } catch (err) {
            console.error("Error al cargar datos del grupo:", err);
            setError("No se pudo cargar la información completa del grupo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarTodo();
    }, [id]);

    const handleRecalcular = async () => {
        setRecalculando(true);
        try {
            await dashboardService.recalculateGroupAnalytics(id);
            await cargarTodo();
        } catch (err) { console.error("Error al recalcular", err); }
        finally { setRecalculando(false); }
    };

    const handleVerDesglose = async () => {
        setMostrarDesglose(true);
        setCargandoDesglose(true);
        try {
            const data = await grupoService.obtenerDesglose(id);
            setDesglose(data);
        } catch (err) { console.error("Error al cargar desglose", err); }
        finally { setCargandoDesglose(false); }
    };

    // --- MANEJADORES DE GASTOS ---
    const handleEliminarGasto = async (gastoId, concepto) => {
        if (window.confirm(`¿Seguro que quieres borrar el gasto "${concepto}"?`)) {
            try {
                await expenseService.eliminar(gastoId);
                await cargarTodo();
            } catch (err) {
                alert("No tienes permiso para eliminar este gasto.");
            }
        }
    };

    const handleEditarGasto = (gasto) => {
        setGastoAEditar(gasto);
        setMostrarFormGasto(true);
    };

    // --- MANEJADORES DE MIEMBROS ---
    const handleInvitar = async (e) => {
        e.preventDefault();
        setInvitando(true);
        try {
            await grupoService.invitarMiembro(id, emailInvitar);
            setEmailInvitar('');
            setMostrarInputInvitar(false);
            await cargarTodo();
            alert("¡Miembro añadido!");
        } catch (err) {
            alert(err.response?.data?.error || "Error al invitar.");
        } finally {
            setInvitando(false);
        }
    };

    const handleRemoverMiembro = async (userId, nombre) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${nombre} del grupo?`)) {
            try {
                await grupoService.removerMiembro(id, userId);
                await cargarTodo();
            } catch (err) {
                alert(err.response?.data?.error || "No tienes permiso para realizar esta acción.");
            }
        }
    };

    const handleLiquidar = async (expenseId, amount) => {
        if (!window.confirm(`¿Deseas registrar un pago de $${amount.toFixed(2)} para saldar tu parte de este gasto? (Se registrará en tus transacciones personales)`)) return;
        try {
            await expenseService.liquidar(expenseId, user._id, amount);
            await cargarTodo();
            alert("¡Deuda saldada y transacción registrada!");
        } catch (err) {
            alert("Error al liquidar la deuda.");
        }
    };

    if (cargando) {
        return (
            <AppLayout>
                <div className="detalle-container">
                    <div className="loading-state-subtle">
                        <div className="spinner-subtle"></div>
                        <p>Sincronizando salud financiera...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }
    if (error) {
        return (
            <AppLayout>
                <div className="detalle-container">
                    <div className="empty-expenses" style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                        {error}
                    </div>
                </div>
            </AppLayout>
        );
    }

    const myBalanceInfo = summary?.balanceByMember?.find(b => b._id === user?._id) || { balance: 0 };
    const balanceUsuario = myBalanceInfo.balance;
    const balanceClass = balanceUsuario > 0 ? 'balance-positive' : balanceUsuario < 0 ? 'balance-negative' : 'balance-neutral';

    const analytics = summary?.group?.analytics || {};
    const stats = summary?.stats || { totalSpent: 0, expenseCount: 0 };

    return (
        <AppLayout>
            <div className="detalle-container">
                <button onClick={() => navigate('/dashboard')} className="btn-back">
                    <ArrowLeftIcon style={{ width: '20px' }} /> Dashboard
                </button>

                <div className="header-grid">
                    <div className="info-card animate-fade-in">
                        <h1 className="detalle-title">{grupo.name}</h1>
                        <p className="detalle-description">{grupo.description}</p>
                        <div className="group-meta-stats">
                            <div className="meta-stat">
                                <span>Gasto Total</span>
                                <strong>${stats.totalSpent.toFixed(2)}</strong>
                            </div>
                            <div className="meta-stat">
                                <span>Cant. Gastos</span>
                                <strong>{stats.expenseCount}</strong>
                            </div>
                        </div>
                    </div>

                    {analytics.stabilityIndex !== undefined && (
                        <div className="column-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h3 className="section-title" style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Salud del Grupo</h3>
                                <button onClick={handleRecalcular} disabled={recalculando} className="btn-tiny">
                                    {recalculando ? '...' : <ArrowPathIcon style={{ width: 14 }} />}
                                </button>
                            </div>
                            <div className="stability-meter">
                                <div className="meter-label">
                                    <span>Índice de Estabilidad</span>
                                    <span>{(analytics.stabilityIndex * 100).toFixed(0)}%</span>
                                </div>
                                <div className="meter-bg">
                                    <div className="meter-fill" style={{
                                        width: `${analytics.stabilityIndex * 100}%`,
                                        background: analytics.stabilityIndex > 0.7 ? '#10B981' :
                                            analytics.stabilityIndex > 0.4 ? '#F59E0B' : '#EF4444'
                                    }}></div>
                                </div>
                            </div>
                            <div className="risk-badge-wrapper">
                                <span className={`role-badge ${analytics.conflictRiskLevel === 'low' ? 'role-admin' : analytics.conflictRiskLevel === 'medium' ? 'role-member' : 'badge-danger'}`} 
                                      style={{ padding: '6px 14px', borderRadius: '12px' }}>
                                    Riesgo {analytics.conflictRiskLevel === 'low' ? 'Bajo' :
                                        analytics.conflictRiskLevel === 'medium' ? 'Medio' : 'Alto'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tarjeta de Balance Dinámica */}
                <div className={`balance-card ${balanceClass}`}>
                    <div>
                        <p className="balance-label">Tu estado actual</p>
                        <p className="balance-amount">
                            {balanceUsuario >= 0 ? 'Te deben' : 'Debes'}
                            <span className={balanceUsuario >= 0 ? 'amount-pos' : 'amount-neg'}>
                                {` $${Math.abs(balanceUsuario).toFixed(2)}`}
                            </span>
                        </p>
                    </div>
                    <div>
                        {Math.abs(balanceUsuario) < 0.01 ?
                            <span className="balance-status-text">Estás al día <CheckCircleIcon style={{ width: 14, display: 'inline' }} /></span> :
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <span className="balance-status-text" style={{ color: 'white' }}>Acción requerida</span>
                                {balanceUsuario < 0 && (
                                    <button className="btn-confirm-invite" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert("Usa los botones 'Saldar' en la lista de gastos abajo para registrar pagos específicos.")}>
                                        ¿Cómo pagar?
                                    </button>
                                )}
                            </div>
                        }
                    </div>
                </div>

                <div className="detalle-grid">
                    {/* Columna Miembros */}
                    <div className="column-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 className="section-title" style={{ margin: 0 }}><UserGroupIcon style={{ width: '24px' }} /> Miembros</h2>
                        <button className="btn-link" style={{ fontSize: '12px' }} onClick={handleVerDesglose}>
                            Ver Desglose
                        </button>
                    </div>

                    {mostrarDesglose && (
                        <div className="card-glass" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-primary-glow)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                                <h4 style={{ margin: 0, fontSize: '13px' }}>Deudas entre miembros</h4>
                                <button className="btn-tiny" onClick={() => setMostrarDesglose(false)}>Cerrar</button>
                            </div>
                            {cargandoDesglose ? <p style={{ fontSize: '12px' }}>Cargando...</p> : 
                             desglose.length === 0 ? <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No hay deudas pendientes.</p> :
                             <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                {desglose.map((d, i) => (
                                    <li key={i} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <strong>{d.fromName === user?.fullName?.split(' ')[0] || d.fromName === user?.fullName ? 'Tú' : d.fromName}</strong> 
                                        {` le debe `} 
                                        <strong>{d.amount.toFixed(2)}$</strong> 
                                        {` a `} 
                                        <strong>{d.toName === user?.fullName?.split(' ')[0] || d.toName === user?.fullName ? 'ti' : d.toName}</strong>
                                    </li>
                                ))}
                             </ul>
                            }
                        </div>
                    )}
                        <ul className="member-list">
                            {grupo.members?.map((m, i) => {
                                const memberBalance = summary?.balanceByMember?.find(b => b._id === m.userId)?.balance || 0;
                                return (
                                    <li key={i} className="member-item">
                                        <div className="member-info-main">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="member-avatar-placeholder">
                                                    {m.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span className="member-name">{m.displayName}</span>
                                                    <span className={`role-badge role-${m.role}`}>{m.role}</span>
                                                </div>
                                            </div>
                                            <span className={`member-balance-mini ${memberBalance > 0 ? 'pos' : memberBalance < 0 ? 'neg' : ''}`}>
                                                {memberBalance > 0 ? `+${memberBalance.toFixed(2)}` : memberBalance.toFixed(2)}
                                            </span>
                                        </div>
                                        {/* Mostrar botón de remover si no es el admin/dueño */}
                                        {m.role !== 'admin' && (
                                            <button
                                                onClick={() => handleRemoverMiembro(m.userId, m.displayName)}
                                                className="btn-remove-member"
                                                title="Eliminar del grupo"
                                            >
                                                <XMarkIcon style={{ width: '18px' }} />
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        {!mostrarInputInvitar ? (
                            <button className="btn-invite" onClick={() => setMostrarInputInvitar(true)}>
                                + Invitar miembro
                            </button>
                        ) : (
                            <form onSubmit={handleInvitar} className="invite-form">
                                <input
                                    type="email"
                                    placeholder="Email del amigo..."
                                    className="invite-input"
                                    value={emailInvitar}
                                    onChange={(e) => setEmailInvitar(e.target.value)}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button type="submit" className="btn-confirm-invite" disabled={invitando}>
                                        {invitando ? '...' : 'Añadir'}
                                    </button>
                                    <button type="button" className="btn-confirm-invite" style={{ backgroundColor: '#95a5a6' }} onClick={() => setMostrarInputInvitar(false)}>
                                        X
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Columna Gastos */}
                    <div className="column-card">
                        <div className="expenses-header">
                            <h2 className="section-title"><CurrencyDollarIcon style={{ width: '24px' }} /> Gastos</h2>
                            <button
                                className="btn-add-expense"
                                onClick={() => {
                                    setGastoAEditar(null);
                                    setMostrarFormGasto(!mostrarFormGasto);
                                }}
                            >
                                {mostrarFormGasto ? 'Cancelar' : '+ Registrar Gasto'}
                            </button>
                        </div>

                        {mostrarFormGasto && (
                            <RegistrarGastoForm
                                grupo={grupo}
                                gastoAEditar={gastoAEditar}
                                onGastoGuardado={() => {
                                    setMostrarFormGasto(false);
                                    setGastoAEditar(null);
                                    cargarTodo();
                                }}
                                onCancelar={() => {
                                    setMostrarFormGasto(false);
                                    setGastoAEditar(null);
                                }}
                            />
                        )}

                        <div className="expenses-list">
                            {gastos.map((g) => (
                                <div key={g._id} className="expense-item">
                                    <div className="expense-info">
                                        <h4 className="expense-concept">{g.concept}</h4>
                                        <p className="expense-meta">Pagado por {g.paidByName}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className="expense-amount-wrapper">
                                            <span className="expense-amount">${g.totalAmount.toFixed(2)}</span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <span className="expense-category-badge">{g.category}</span>
                                                {(() => {
                                                    const mySplit = g.splits?.find(s => String(s.userId) === String(user?._id));
                                                    const isPayer = String(g.paidBy) === String(user?._id);
                                                    const remaining = mySplit ? (mySplit.amountOwed - mySplit.amountPaid) : 0;

                                                    if (!isPayer && remaining > 0) {
                                                        return (
                                                            <button
                                                                className="btn-tiny btn-success"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLiquidar(g._id, remaining);
                                                                }}
                                                                title="Saldar mi parte"
                                                                style={{ marginLeft: '8px' }}
                                                            >
                                                                Saldar
                                                            </button>
                                                        );
                                                    }
                                                    if (remaining <= 0 && !isPayer && mySplit) {
                                                        return <span className="badge badge-success" style={{ fontSize: '10px' }}>Pagado</span>;
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                        <div className="expense-actions">
                                            <button
                                                className="btn-icon-edit"
                                                onClick={() => handleEditarGasto(g)}
                                                title="Editar"
                                            >
                                                <PencilIcon style={{ width: '18px' }} />
                                            </button>
                                            <button
                                                className="btn-icon-delete"
                                                onClick={() => handleEliminarGasto(g._id, g.concept)}
                                                title="Eliminar"
                                            >
                                                <TrashIcon style={{ width: '18px' }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default DetalleGrupo;