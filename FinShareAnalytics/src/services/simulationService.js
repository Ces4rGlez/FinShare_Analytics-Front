import API from './api';

const simulationService = {
  create: async (payload) => {
    const res = await API.post('/simulations/', payload);
    return res.data.data || res.data;
  },

  preview: async (payload) => {
    const res = await API.post('/simulations/preview', payload);
    return res.data.data || res.data;
  },

  list: async () => {
    const res = await API.get('/simulations/');
    return res.data.data || res.data;
  },

  getById: async (id) => {
    const res = await API.get(`/simulations/${id}`);
    return res.data.data || res.data;
  },

  delete: async (id) => {
    const res = await API.delete(`/simulations/${id}`);
    return res.data.data || res.data;
  },
};

export default simulationService;
