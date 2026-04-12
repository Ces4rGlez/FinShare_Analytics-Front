import API from './api';

const authService = {
  login: async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    return res.data.data || res.data;
  },

  register: async ({ fullName, email, password, phone = null }) => {
    // Aligned with RegisterSchema: fullName, email, password, phone
    const res = await API.post('/auth/register', { fullName, email, password, phone });
    return res.data.data || res.data;
  },

  getProfile: async () => {
    const res = await API.get('/auth/profile');
    return res.data.data || res.data;
  },

  updateFinance: async (payload) => {
    // Aligned with FinanceProfileSchema: monthlyIncome, fixedExpenses, variableExpenses, savings, incomeStability
    const res = await API.put('/auth/profile/finance', payload);
    return res.data.data || res.data;
  },

  addDebt: async (payload) => {
    // Aligned with DebtSchema: creditor, totalAmount, remainingAmount, monthlyPayment, debtType, isActive
    const res = await API.post('/auth/profile/debts', payload);
    return res.data.data || res.data;
  },
};

export default authService;
