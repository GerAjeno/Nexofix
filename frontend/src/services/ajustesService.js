const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/ajustes`;

export const getAjustesGenerales = async () => {
  const token = localStorage.getItem('nexofix_token');
  const response = await fetch(`${API_URL}/general`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener ajustes generales');
  return response.json();
};

export const updateAjustesGenerales = async (ajustesData) => {
  const token = localStorage.getItem('nexofix_token');
  const response = await fetch(`${API_URL}/general`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(ajustesData)
  });
  if (!response.ok) throw new Error('Error al actualizar ajustes generales');
  return response.json();
};

export const uploadLogo = async (file) => {
  const token = localStorage.getItem('nexofix_token');
  const formData = new FormData();
  formData.append('imagen', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) throw new Error('Error al subir el logo corporativo');
  return response.json();
};

