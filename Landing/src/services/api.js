/**
 * Servicio para manejar las llamadas a la API
 * 
 * Este servicio centraliza todas las llamadas a la API y maneja automáticamente
 * la configuración de la URL base según el entorno (desarrollo/producción).
 */

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Obtener la URL base de la API según el entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Realiza una petición HTTP al servidor
 * @param {string} endpoint - El endpoint de la API a consultar
 * @param {Object} options - Opciones para la petición fetch
 * @returns {Promise<Response>} - La respuesta de la API
 */
const apiRequest = async (endpoint, options = {}) => {
  // Configurar headers por defecto
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${API_TOKEN}`,
    ...options.headers,
  };

  // Construir la URL completa
  const url = IS_DEVELOPMENT 
    ? `${API_BASE_URL}${endpoint}`  // En desarrollo, usa el proxy
    : `${import.meta.env.VITE_API_TARGET}${import.meta.env.VITE_API_PREFIX}${endpoint}`; // En producción, usa la URL completa

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si la respuesta no es exitosa, lanzar un error
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

/**
 * Obtiene información de un usuario por su cédula
 * @param {string} cedula - Número de cédula del usuario
 * @returns {Promise<Object>} - Datos del usuario
 */
export const getUserByCedula = async (cedula) => {
  const response = await apiRequest(`/dinamic-db/report/${cedula}/assesmentDEV`, {
    method: 'GET',
  });
  return response.json();
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @param {string} userData.cedula - Número de cédula
 * @param {string} userData.nombre - Nombre completo
 * @param {string} userData.telefono - Número de teléfono
 * @param {string} userData.ciudad - Ciudad de residencia
 * @param {string} userData.foto - Foto en base64 (opcional)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
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
