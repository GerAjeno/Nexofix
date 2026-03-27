import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/cotizaciones`;

export const cotizacionesService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (cotizacionData) => {
    const response = await axios.post(API_URL, cotizacionData);
    return response.data;
  },

  update: async (id, cotizacionData) => {
    const response = await axios.put(`${API_URL}/${id}`, cotizacionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  aceptar: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/aceptar`);
    return response.data;
  }
};

