import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientesService = {
  getAll: () => api.get('/clientes').then(res => res.data),
  getById: (id) => api.get(`/clientes/${id}`).then(res => res.data),
  create: (data) => api.post('/clientes', data).then(res => res.data),
  update: (id, data) => api.put(`/clientes/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/clientes/${id}`).then(res => res.data),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};

export default api;
