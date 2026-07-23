import axios from 'axios';

const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL + '/auth',
  withCredentials: true,
});

const transactionAPI = axios.create({
  baseURL: import.meta.env.VITE_TRANSACTION_URL + '/transactions',
  withCredentials: true,
});

const auditAPI = axios.create({
  baseURL: import.meta.env.VITE_AUDIT_URL + '/audit',
  withCredentials: true,
});

const setupInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(authAPI);
setupInterceptors(transactionAPI);
setupInterceptors(auditAPI);

export { authAPI, transactionAPI, auditAPI };
