// Funcion para generar reportes en caso de errores internos
import generateReport from "./generateReport.js";

/**
 * @class FormatterResponseController
 * @description Maneja las posibles respuestas que dará el controlador hacia el frontend
 * @author Gabriel Leonett
 */
export default class FormatterResponseController {
  /**
   * @static
   * @method respuestaExito
   * @description Devuelve una respuesta exitosa estructurada
   * @param {Object} res Objeto response de Express
   * @param {Object} serviceResponse Respuesta del servicio
   * @returns {Object} Respuesta estructurada para el frontend
   */
  static respuestaExito(res, serviceResponse) {
    try {
      // Extraer datos de la respuesta del servicio de forma más eficiente
      const {
        data = null,
        message = "Operación exitosa",
        metadata = {},
      } = serviceResponse;

      // Eliminar redundancias de metadata
      const {
        status: metadataStatus,
        title: metadataTitle,
        timestamp,
        ...cleanMetadata
      } = metadata;

      const response = {
        success: true,
        status: serviceResponse.status || 200,
        title: metadataTitle || serviceResponse.title || "Éxito",
        message: message,
        data: data, // Usar data directamente sin anidar innecesariamente
        ...(Object.keys(cleanMetadata).length > 0 && {
          metadata: cleanMetadata,
        }),
      };

      // Incluir paginación si existe (sin duplicar en metadata)
      if (metadata.pagination) {
        response.pagination = metadata.pagination;
      }

      console.log("✅ Respuesta exitosa optimizada:", response);
      return res.status(response.status).json(response);
    } catch (error) {
      return this.respuestaError(res, {
        status: 500,
        title: "Error del Controlador",
        message: "Error al procesar respuesta exitosa",
        error: error.message,
      });
    }
  }

  /**
   * @static
   * @method respuestaError
   * @description Devuelve una respuesta de error estructurada
   * @param {Object} res Objeto response de Express
   * @param {Object} serviceResponse Respuesta de error del servicio
   * @returns {Object} Respuesta de error estructurada para el frontend
   */
  static respuestaError(res, serviceResponse) {
    try {
      // Manejar diferentes tipos de errores
      if (
        serviceResponse.status === 400 &&
        serviceResponse.error?.code === "VALIDATION_ERROR"
      ) {
        return this.respuestaValidacionError(res, serviceResponse);
      }

      if (serviceResponse instanceof Error) {
        return this.respuestaError(res, {
          status: 500,
          title: "Error Interno",
          message: serviceResponse.message,
          error: serviceResponse,
        });
      }

      const status = serviceResponse.status || 500;
      const errorInfo = serviceResponse.error || {};

      const response = {
        success: false,
        status: status,
        title: serviceResponse.title || this.getDefaultTitle(status),
        message: serviceResponse.message || "Error interno del servidor",
        error: {
          code: errorInfo.code || this.getErrorCode(status),
          ...(errorInfo.details && { details: errorInfo.details }),
        },
      };

      console.log("❌ Respuesta de error optimizada:", response);
      return res.status(status).json(response);
    } catch (internalError) {
      generateReport({
        status: 500,
        state: "critical",
        title: "Error en el manejador de errores del controlador",
        message: internalError.message,
        stack: internalError.stack,
      });

      return res.status(500).json({
        success: false,
        status: 500,
        title: "Error Crítico",
        message: "Error interno en el servidor",
        error: {
          code: "CONTROLLER_ERROR",
        },
      });
    }
  }

  /**
   * @static
   * @method respuestaValidacionError
   * @description Maneja específicamente errores de validación
   * @param {Object} res Objeto response de Express
   * @param {Object} serviceResponse Respuesta de validación del servicio
   * @returns {Object} Respuesta de validación estructurada
   */
  static respuestaValidacionError(res, serviceResponse) {
    const errorInfo = serviceResponse.error || {};
    const validationErrors = errorInfo.details?.validationErrors || [];

    const response = {
      success: false,
      status: 400,
      title: serviceResponse.title || "Error de Validación",
      message:
        serviceResponse.message || "Los datos proporcionados son inválidos",
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        details: {
          validationErrors: this.formatValidationErrors(validationErrors),
          totalErrors: validationErrors.length,
        },
        timestamp: errorInfo.timestamp || new Date().toISOString(),
      },
    };

    console.log("❌ Error de validación:", response);
    return res.status(400).json(response);
  }

  /**
   * @static
   * @method formatValidationErrors
   * @description Formatea los errores de validación para una estructura consistente
   * @param {Array|Object} errors Errores de validación
   * @returns {Array} Errores formateados
   */
  static formatValidationErrors(errors) {
    if (!errors) return [];

    // Si es array, mantener estructura
    if (Array.isArray(errors)) {
      return errors.map((error) => ({
        field: error.field || error.path || "unknown",
        message: error.message || "Error de validación",
        value: error.value !== undefined ? error.value : null,
        type: error.type || "validation",
      }));
    }

    // Si es objeto, convertirlo a array
    if (typeof errors === "object") {
      return Object.keys(errors).map((key) => ({
        field: key,
        message: errors[key].message || errors[key] || "Error de validación",
        value: errors[key].value !== undefined ? errors[key].value : null,
        type: errors[key].type || "validation",
      }));
    }

    return [];
  }

  /**
   * @static
   * @method respuestaServicio
   * @description Método principal que maneja cualquier respuesta del servicio
   * @param {Object} res Objeto response de Express
   * @param {Object} serviceResponse Respuesta del servicio
   * @returns {Object} Respuesta estructurada
   */
  static respuestaServicio(res, serviceResponse) {
    try {
      if (!serviceResponse) {
        return this.respuestaError(res, {
          status: 500,
          title: "Error del Servicio",
          message: "El servicio no devolvió una respuesta válida",
        });
      }

      // Verificar si es respuesta exitosa o de error
      if (serviceResponse.success === true) {
        return this.respuestaExito(res, serviceResponse);
      } else {
        return this.respuestaError(res, serviceResponse);
      }
    } catch (error) {
      return this.respuestaError(res, {
        status: 500,
        title: "Error del Controlador",
        message: "Error al procesar respuesta del servicio",
        error: error.message,
      });
    }
  }

  /**
   * @static
   * @method respuestaDatos
   * @description Versión simplificada para respuestas solo con datos
   * @param {Object} res Objeto response de Express
   * @param {Object} data Datos a enviar
   * @param {Object} metadata Metadatos adicionales
   * @returns {Object} Respuesta estructurada
   */
  static respuestaDatos(res, data, metadata = {}) {
    return this.respuestaExito(res, {
      status: 200,
      success: true,
      message: metadata.message || "Datos obtenidos exitosamente",
      data: data,
      metadata: metadata,
    });
  }

  /**
   * @static
   * @method respuestaPaginada
   * @description Respuesta específica para datos paginados
   * @param {Object} res Objeto response de Express
   * @param {Array} data Datos de la página actual
   * @param {Object} pagination Información de paginación
   * @param {string} message Mensaje personalizado
   * @returns {Object} Respuesta paginada estructurada
   */
  static respuestaPaginada(
    res,
    data,
    pagination,
    message = "Datos paginados obtenidos exitosamente"
  ) {
    return this.respuestaExito(res, {
      status: 200,
      success: true,
      message: message,
      data: data,
      metadata: {
        pagination: pagination,
        title: "Datos Paginados",
      },
    });
  }

  /**
   * @static
   * @method getDefaultTitle
   * @description Obtiene título por defecto basado en el código de estado
   * @param {number} status Código HTTP
   * @returns {string} Título descriptivo
   */
  static getDefaultTitle(status) {
    const titles = {
      400: "Solicitud Incorrecta",
      401: "No Autorizado",
      403: "Prohibido",
      404: "No Encontrado",
      409: "Conflicto",
      422: "Entidad No Procesable",
      500: "Error del Servidor",
    };
    return titles[status] || "Error";
  }

  /**
   * @static
   * @method getErrorCode
   * @description Obtiene código de error basado en el código de estado
   * @param {number} status Código HTTP
   * @returns {string} Código de error
   */
  static getErrorCode(status) {
    const codes = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      500: "INTERNAL_ERROR",
    };
    return codes[status] || "UNKNOWN_ERROR";
  }
}
