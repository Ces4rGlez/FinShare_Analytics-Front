import api from './api';

const expenseService = {
  // Crear un nuevo gasto
  crear: async (groupId, datosGasto) => {
    const response = await api.post(`/groups/${groupId}/expenses`, datosGasto);
    return response.data.data || response.data;
  },

  // Obtener todos los gastos de un grupo
  obtenerDeGrupo: async (groupId, page = 1) => {
    const response = await api.get(`/groups/${groupId}/expenses?page=${page}`);
    return response.data.data || response.data;
  },

  obtenerBalances: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/balances`);
    return response.data.data || response.data;
  },

  actualizar: async (expenseId, datosNuevos) => {
    const response = await api.patch(`/expenses/${expenseId}`, datosNuevos);
    return response.data;
  },

  eliminar: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  }
};

export default expenseService;