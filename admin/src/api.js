import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Request interceptor to add authorization token
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('shopvista_admin_user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Response interceptor to handle session expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('shopvista_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
