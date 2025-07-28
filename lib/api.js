// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-mern-simpleecommerce.idkoding.com/api',
});

// Inject token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
