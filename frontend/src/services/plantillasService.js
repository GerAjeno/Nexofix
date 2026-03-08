import axios from 'axios';

const API_URL = 'http://localhost:3000/api/plantillas';

export const plantillasService = {
  getTextos: async (tipo) => {
    const response = await axios.get(`${API_URL}/textos`, { params: { tipo } });
    return response.data;
  },
  
  createTexto: async (data) => {
    const response = await axios.post(`${API_URL}/textos`, data);
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
