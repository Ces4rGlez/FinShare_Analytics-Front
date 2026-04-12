import API from './api';

const transactionService = {
  create: async (data) => {
    // Aligned with TransactionSchema: type, amount, concept, category, currency, transactionDate, notes
    const res = await API.post('/transactions/', data);
    return res.data.data || res.data;
  },

  list: async (type = null, page = 1, per_page = 20) => {
    const params = { page, per_page };
    if (type) params.type = type;
    const res = await API.get('/transactions/', { params });
    return res.data.data || res.data;
  },

  update: async (id, data) => {
    const res = await API.put(`/transactions/${id}`, data);
    return res.data.data || res.data;
  },

  delete: async (id) => {
    const res = await API.delete(`/transactions/${id}`);
    return res.data.data || res.data;
  },

  obtenerResumen: async () => {
    const res = await API.get('/transactions/summary');
    return res.data.data || res.data;
  },

  obtenerPorId: async (id) => {
    const res = await API.get(`/transactions/${id}`);
    return res.data.data || res.data;
  }
};

export default transactionService;
