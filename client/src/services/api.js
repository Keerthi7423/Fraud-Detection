import axios from 'axios';

const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL + '/auth',
});

const transactionAPI = axios.create({
  baseURL: import.meta.env.VITE_TRANSACTION_URL + '/api', // Assuming /api prefix for transactions
});

const auditAPI = axios.create({
  baseURL: import.meta.env.VITE_AUDIT_URL + '/audit',
});

const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(authAPI);
setupInterceptors(transactionAPI);
setupInterceptors(auditAPI);

export { authAPI, transactionAPI, auditAPI };
