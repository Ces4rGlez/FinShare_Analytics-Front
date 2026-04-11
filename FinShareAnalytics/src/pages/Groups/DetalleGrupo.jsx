import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grupoService from '../../services/grupoService';
import expenseService from '../../services/expenseService';
import { 
    ArrowLeftIcon, 
    UserGroupIcon, 
    CurrencyDollarIcon, 
    XMarkIcon, 
    PencilIcon, 
    TrashIcon 
} from '@heroicons/react/24/outline';
import '../../assets/styles/DetalleGrupo.css';
import RegistrarGastoForm from '../../components/forms/RegistrarGastoForm';

function DetalleGrupo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [grupo, setGrupo] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [balanceUsuario, setBalanceUsuario] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados para formularios y modales
    const [mostrarInputInvitar, setMostrarInputInvitar] = useState(false);
    const [emailInvitar, setEmailInvitar] = useState('');
    const [invitando, setInvitando] = useState(false);
    
    const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
    const [gastoAEditar, setGastoAEditar] = useState(null);

    // Cargar datos de gastos y balances
    const cargarDatosFinancieros = async () => {
        try {
            const dataGastos = await expenseService.obtenerDeGrupo(id);
            const listaGastos = dataGastos.items || dataGastos || [];
            setGastos(listaGastos);

            const balances = await expenseService.obtenerBalances(id);
            // Buscamos el balance del usuario logueado (Ronaldo)
            const miBalance = balances.find(b => b.userName === 'Ronaldo Chavez') || { balanceNeto: 0 };
            setBalanceUsuario(miBalance.balanceNeto);
        } catch (err) {
            console.error("Error al cargar finanzas:", err);
        }
    };

    // Cargar información del grupo al inicio
    useEffect(() => {
        const cargarTodo = async () => {
            try {
                const dataGrupo = await grupoService.obtenerPorId(id);
                setGrupo(dataGrupo);
                await cargarDatosFinancieros();
            } catch (err) {
                setError("No se pudo cargar la información del grupo.");
            } finally {
                setCargando(false);
            }
        };
        cargarTodo();
    }, [id]);

    // --- MANEJADORES DE GASTOS ---
    const handleEliminarGasto = async (gastoId, concepto) => {
        if (window.confirm(`¿Seguro que quieres borrar el gasto "${concepto}"?`)) {
            try {
                await expenseService.eliminar(gastoId);
                await cargarDatosFinancieros();
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
            const dataGrupo = await grupoService.obtenerPorId(id);
            setGrupo(dataGrupo);
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
                const dataGrupo = await grupoService.obtenerPorId(id);
                setGrupo(dataGrupo);
                await cargarDatosFinancieros(); // Recalcular balances tras remover
            } catch (err) {
                alert(err.response?.data?.error || "No tienes permiso para realizar esta acción.");
            }
        }
    };

    if (cargando) return <div className="empty-expenses">Cargando...</div>;
    if (error) return <div className="empty-expenses" style={{ color: '#e74c3c' }}>{error}</div>;

    const balanceClass = balanceUsuario > 0 ? 'balance-positive' : balanceUsuario < 0 ? 'balance-negative' : 'balance-neutral';

    return (
        <div className="detalle-container">
            <button onClick={() => navigate(-1)} className="btn-back">
                <ArrowLeftIcon style={{ width: '20px' }} /> Volver al Dashboard
            </button>

            <div className="info-card">
                <h1 className="detalle-title">{grupo.name}</h1>
                <p className="detalle-description">{grupo.description}</p>
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
                    {balanceUsuario === 0 ? 
                        <span className="balance-status-text">Estás al día 👍</span> : 
                        <button className="btn-add-expense">Ver detalles</button>
                    }
                </div>
            </div>

            <div className="detalle-grid">
                {/* Columna Miembros */}
                <div className="column-card">
                    <h2 className="section-title"><UserGroupIcon style={{width:'24px'}}/> Miembros</h2>
                    <ul className="member-list">
                        {grupo.members?.map((m, i) => (
                            <li key={i} className="member-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="member-name">{m.displayName}</span>
                                    <span className={`member-role role-${m.role}`}>{m.role}</span>
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
                        ))}
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
                                <button type="button" className="btn-confirm-invite" style={{backgroundColor: '#95a5a6'}} onClick={() => setMostrarInputInvitar(false)}>
                                    X
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Columna Gastos */}
                <div className="column-card">
                    <div className="expenses-header">
                        <h2 className="section-title"><CurrencyDollarIcon style={{width:'24px'}}/> Gastos</h2>
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
                                cargarDatosFinancieros(); 
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
                                        <span className="expense-category-badge">{g.category}</span>
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
    );
}

export default DetalleGrupo;