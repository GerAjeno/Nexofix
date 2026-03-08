import axios from 'axios';

const API_URL = 'http://localhost:3000/api/cotizaciones';

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

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};
