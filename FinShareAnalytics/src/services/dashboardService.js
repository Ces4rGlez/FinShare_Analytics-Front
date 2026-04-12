import API from './api';

const dashboardService = {
  getPersonal: async () => {
    const res = await API.get('/dashboard/personal');
    return res.data.data || res.data;
  },

  getGroupSummary: async (groupId) => {
    const res = await API.get(`/dashboard/group/${groupId}`);
    return res.data.data || res.data;
  },

  recalculateGroupAnalytics: async (groupId) => {
    const res = await API.put(`/dashboard/group/${groupId}/analytics`);
    return res.data.data || res.data;
  },
};

export default dashboardService;
