const API_URL = 'http://localhost:5000/api/auth';

const getToken = () => localStorage.getItem('token');

const authService = {
  register: async ({ fullName, email, password, phone }) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar');
    return data;
  },

  login: async ({ email, password }) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener perfil');
    return data;
  },

  updateFinance: async (financeData) => {
    const res = await fetch(`${API_URL}/profile/finance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(financeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar');
    return data;
  },

  addDebt: async (debtData) => {
    const res = await fetch(`${API_URL}/profile/debts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(debtData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar deuda');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;