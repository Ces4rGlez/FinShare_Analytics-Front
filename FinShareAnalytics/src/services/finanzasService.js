const API_URL = 'http://localhost:5000/api/transactions/';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const finanzasService = {
  registrarMovimiento: async (movimiento) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        concept:         movimiento.concepto,
        amount:          movimiento.monto,
        type:            movimiento.tipo === 'ingreso' ? 'income' : 'expense',
        category:        movimiento.categoria || 'other',
        notes:           movimiento.notas || null,
        transactionDate: movimiento.fecha || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar movimiento');
    return data;
  },

  obtenerMovimientos: async () => {
    const res = await fetch(`${API_URL}?per_page=100`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener movimientos');
    return data;
  },

  eliminarMovimiento: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar movimiento');
    return data;
  },
};

export default finanzasService;