import axios from 'axios';

const API_BASE_URL = '/hrdesk_new/service/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Request interceptor - URL:', config.url, 'BaseURL:', config.baseURL, 'Full URL:', config.baseURL + config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/hrdesk_new/ui/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Test endpoint to verify API connectivity
export const testAPI = () => {
  console.log('Testing API connectivity...');
  return fetch('/hrdesk_new/service/api/auth/login', {
    method: 'OPTIONS',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(response => {
    console.log('Test response status:', response.status);
    return response;
  }).catch(err => {
    console.error('Test failed:', err);
    return err;
  });
};

export const employeeAPI = {
  getAll: (page = 1) => api.get(`/employees?page=${page}`),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceAPI = {
  getAll: (filters = {}) => api.get('/attendance', { params: filters }),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const allowanceAPI = {
  getAll: (employeeId = null) => api.get('/allowances', { 
    params: employeeId ? { employee_id: employeeId } : {} 
  }),
  getById: (id) => api.get(`/allowances/${id}`),
  create: (data) => api.post('/allowances', data),
  update: (id, data) => api.put(`/allowances/${id}`, data),
  delete: (id) => api.delete(`/allowances/${id}`),
};

export const menuAPI = {
  getAll: () => api.get('/menus'),
  search: (searchTerm) => api.get('/menus/search', { params: { search: searchTerm } }),
  getSubmenus: (menuId) => api.get(`/menus/${menuId}/submenus`),
};

export default api;
