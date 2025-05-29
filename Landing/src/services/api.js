/**
 * Servicio para manejar las llamadas a la API
 */

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${API_TOKEN}`,
    ...options.headers,
  };

  // SIEMPRE usar /api - el Worker hará el proxy
  const url = `/api${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Error en la petición');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

export const getUserByCedula = async (cedula) => {
  const response = await apiRequest(`/dinamic-db/report/${cedula}/assesmentDEV`, {
    method: 'GET',
  });
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await apiRequest(`/dinamic-db/report/${userData.cedula}/assesmentDEV`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return response.json();
};

export default {
  getUserByCedula,
  registerUser,
};