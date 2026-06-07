import { transactionAPI } from './api';

const transactionService = {
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await transactionAPI.get(`?${params.toString()}`);
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await transactionAPI.get(`/${id}`);
    return response.data;
  },

  createTransaction: async (data = {}) => {
    const response = await transactionAPI.post('/', data);
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await transactionAPI.patch(`/${id}`, data);
    return response.data;
  },

  getQueue: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await transactionAPI.get(`/queue${params.toString() ? '?' + params.toString() : ''}`);
    return response.data;
  },

  getStats: async () => {
    const response = await transactionAPI.get('/stats');
    return response.data;
  },

  getTrends: async () => {
    const response = await transactionAPI.get('/trends');
    return response.data;
  },

  getCategories: async () => {
    const response = await transactionAPI.get('/categories');
    return response.data;
  },

  getHourly: async () => {
    const response = await transactionAPI.get('/hours');
    return response.data;
  }
};

export default transactionService;
