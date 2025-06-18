import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    return { token, user };
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    return { token, user };
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
  
  updateProfile: async (updates) => {
    const response = await api.patch('/auth/profile', updates);
    return response.data.user;
  }
};

// Catalog services
export const catalogService = {
  getEquipment: async () => {
    const response = await api.get('/catalog/equipment');
    return response.data;
  },
  
  createEquipment: async (equipment) => {
    const response = await api.post('/catalog/equipment', equipment);
    return response.data;
  },
  
  updateEquipment: async (id, updates) => {
    const response = await api.patch(`/catalog/equipment/${id}`, updates);
    return response.data;
  },
  
  deleteEquipment: async (id) => {
    const response = await api.delete(`/catalog/equipment/${id}`);
    return response.data;
  },
  
  getPackages: async () => {
    const response = await api.get('/catalog/packages');
    return response.data;
  },
  
  createPackage: async (pkg) => {
    const response = await api.post('/catalog/packages', pkg);
    return response.data;
  },
  
  updatePackage: async (id, updates) => {
    const response = await api.patch(`/catalog/packages/${id}`, updates);
    return response.data;
  },
  
  deletePackage: async (id) => {
    const response = await api.delete(`/catalog/packages/${id}`);
    return response.data;
  },
  
  getFinancingOptions: async () => {
    const response = await api.get('/catalog/financing');
    return response.data;
  },
  
  createFinancingOption: async (option) => {
    const response = await api.post('/catalog/financing', option);
    return response.data;
  },
  
  updateFinancingOption: async (id, updates) => {
    const response = await api.patch(`/catalog/financing/${id}`, updates);
    return response.data;
  },
  
  deleteFinancingOption: async (id) => {
    const response = await api.delete(`/catalog/financing/${id}`);
    return response.data;
  }
};

// Quote services
export const quoteService = {
  getQuotes: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },
  
  getQuote: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },
  
  createQuote: async (quote) => {
    const response = await api.post('/quotes', quote);
    return response.data;
  },
  
  updateQuote: async (id, updates) => {
    const response = await api.patch(`/quotes/${id}`, updates);
    return response.data;
  },
  
  sendQuote: async (id, { sendMethod, pdfBase64 }) => {
    const response = await api.post(`/quotes/${id}/send`, { sendMethod, pdfBase64 });
    return response.data;
  },
  
  getQuoteStatus: async (id) => {
    const response = await api.get(`/quotes/${id}/status`);
    return response.data;
  },
  
  getQuoteStats: async () => {
    const response = await api.get('/quotes/stats/summary');
    return response.data;
  }
};

// User services (admin only)
export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id, updates) => {
    const response = await api.patch(`/users/${id}`, updates);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default api;