import API from './api';

const riskService = {
  analyze: async () => {
    const res = await API.post('/risk/analyze');
    return res.data.data || res.data;
  },

  getReport: async () => {
    const res = await API.get('/risk/report');
    return res.data.data || res.data;
  },
};

export default riskService;
