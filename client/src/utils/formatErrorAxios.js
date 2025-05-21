/**
 * Formatea errores de Axios en un objeto estandarizado
 * @param {Error} error - Objeto de error de Axios
 * @returns {Object} - Objeto formateado con estructura consistente
 */

export function formatErrorAxios(error) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      return {
        status: error.response.status,
        data: error.response.data || {},
        message: error.response.data?.message || error.message || 'Error del servidor',
      };
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return {
        status: 0,
        statusText: 'NO_RESPONSE',
        data: null,
        message: 'No se recibió respuesta del servidor',
        isNetworkError: true,
      };
    } else {
      // Error al configurar la petición
      return {
        status: -1,
        statusText: 'CONFIG_ERROR',
        data: null,
        message: error.message || 'Error al configurar la petición',
        isConfigError: true,
      };
    }
  }