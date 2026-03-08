import axios from 'axios';

const API_URL = 'http://localhost:3000/api/plantillas';

export const plantillasService = {
  getTextos: async (tipo) => {
    const response = await axios.get(`${API_URL}/textos`, { params: { tipo } });
    return response.data;
  },
  
  deleteTexto: async (id) => {
    const response = await axios.delete(`${API_URL}/textos/${id}`);
    return response.data;
  },

  createTexto: async (data) => {
    const response = await axios.post(`${API_URL}/textos`, data);
    return response.data;
  },

  // Itemizados Completos
  createItemizadoPreset: async (nombre, items) => {
    const response = await axios.post(`${API_URL}/itemizados`, { nombre, items });
    return response.data;
  },

  getItemizadosPresets: async () => {
    const response = await axios.get(`${API_URL}/itemizados`);
    return response.data;
  },

  getItemizadoDetails: async (id) => {
    const response = await axios.get(`${API_URL}/itemizados/${id}`);
    return response.data;
  },

  getItems: async () => {
    const response = await axios.get(`${API_URL}/items`);
    return response.data;
  },

  createItem: async (data) => {
    const response = await axios.post(`${API_URL}/items`, data);
    return response.data;
  }
};
