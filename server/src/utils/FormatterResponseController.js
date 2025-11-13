// Funcion para generar reportes en caso de errores internos
import logger from "../config/winston.config.js";

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
      const {
        data = null,
        message = null,
        title = null,
        metadata = {},
      } = serviceResponse;

      // Eliminar redundancias de metadata
      const {
        status: metadataStatus,
        title: metadataTitle,
        timestamp,
        ...cleanMetadata
      } = metadata;
      console.log(metadata, title);

      const response = {
        success: true,
        status: serviceResponse.status || 200,
        title: title || metadataTitle || "formatter:success.default_title",
        message: message || "formatter:success.default_message",
        data: data,
        ...(Object.keys(cleanMetadata).length > 0 && {
          metadata: cleanMetadata,
        }),
      };

      // Incluir paginación si existe
      if (metadata.pagination) {
        response.pagination = metadata.pagination;
      }

      // Log simple
      logger.info("formatter:logs.success_response", {
        status: response.status,
        title: response.title,
        hasData: !!data,
      });

      console.log(response);

      return res.status(response.status).json(response);
    } catch (error) {
      logger.error("formatter:logs.critical_error", {
        error: error.message,
        serviceResponse: serviceResponse,
      });

      return this.respuestaError(res, {
        status: 500,
        title: "formatter:error.controller",
        message: "formatter:error.internal_server",
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
  static async respuestaError(res, serviceResponse) {
    try {
      // DETECCIÓN MEJORADA DE ERRORES 4xx
      const isClientError =
        (serviceResponse.status >= 400 && serviceResponse.status < 500) ||
        serviceResponse.error?.code === "UNAUTHORIZED" ||
        serviceResponse.error?.code === "VALIDATION_ERROR" ||
        serviceResponse.error?.code?.includes("NOT_FOUND") ||
        serviceResponse.error?.code?.includes("NO_") ||
        serviceResponse.error?.code?.includes("INVALID_") ||
        serviceResponse.title?.includes("No Autorizado") ||
        serviceResponse.title?.includes("Validación") ||
        serviceResponse.title?.includes("No Encontrado") ||
        serviceResponse.message?.includes("inválid") ||
        serviceResponse.message?.includes("incorrect") ||
        serviceResponse.message?.includes("no encontrado");

      if (isClientError) {
        logger.warn("formatter:logs.client_error", {
          status: serviceResponse.status,
          title: serviceResponse.title,
          message: serviceResponse.message,
        });

        // Caso específico: Validación
        if (
          serviceResponse.error?.code === "VALIDATION_ERROR" ||
          serviceResponse.error?.details?.validationErrors
        ) {
          return this.respuestaValidacionError(res, serviceResponse);
        }

        // Para otros errores 4xx, mostrar el mensaje original
        const status = serviceResponse.status || 400;

        const response = {
          success: false,
          status: status,
          title: serviceResponse.title || `formatter:http.${status}`,
          message: serviceResponse.message || "formatter:error.client",
          error: serviceResponse.error?.details || {},
        };

        return res.status(status).json(response);
      }

      // Si es una instancia de Error nativa
      if (serviceResponse instanceof Error) {
        logger.error("formatter:logs.critical_error", {
          message: serviceResponse.message,
          name: serviceResponse.name,
        });

        return this.respuestaError(res, {
          status: 500,
          title: "formatter:error.controller",
          message: serviceResponse.message,
          error: {
            code: "INTERNAL_ERROR",
            details: {
              stack:
                process.env.MODE === "DEVELOPMENT"
                  ? serviceResponse.stack
                  : undefined,
            },
          },
        });
      }

      // Para errores 500 (sin detalles al usuario)
      if (serviceResponse.status === 500 || !serviceResponse.status) {
        logger.error("formatter:logs.server_error", {
          status: 500,
          title: serviceResponse.title,
          message: serviceResponse.message,
        });

        const response = {
          success: false,
          status: 500,
          title: "formatter:error.controller",
          message: "formatter:error.internal_server",
          error: {
            code: serviceResponse.error?.code || "INTERNAL_SERVER_ERROR",
          },
        };

        return res.status(500).json(response);
      }

      // Caso por defecto (otros errores)
      const defaultStatus = 500;
      const status =
        (typeof serviceResponse.status === "number" &&
          serviceResponse.status) ||
        defaultStatus;

      logger.error("formatter:logs.generic_error", {
        status: status,
        title: serviceResponse.title,
        message: serviceResponse.message,
      });

      const response = {
        success: false,
        status: status,
        title: serviceResponse.title || `formatter:http.${status}`,
        message: serviceResponse.message || "formatter:error.internal_server",
        error: serviceResponse.error?.details,
      };

      return res.status(status).json(response);
    } catch (internalError) {
      logger.error("formatter:logs.critical_error", {
        error: internalError.message,
        serviceResponse: serviceResponse,
      });

      return res.status(500).json({
        success: false,
        status: 500,
        title: "formatter:error.critical",
        message: "formatter:error.internal_server",
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

    let validationErrors = [];

    if (errorInfo.details?.validationErrors) {
      validationErrors = errorInfo.details.validationErrors;
    } else if (serviceResponse.validationErrors) {
      validationErrors = serviceResponse.validationErrors;
    } else if (errorInfo.validationErrors) {
      validationErrors = errorInfo.validationErrors;
    } else if (serviceResponse.error?.validationErrors) {
      validationErrors = serviceResponse.error.validationErrors;
    }

    const response = {
      success: false,
      status: 400,
      title: serviceResponse.title || "formatter:error.validation",
      message: serviceResponse.message || "formatter:error.invalid_data",
      data: null,
      error: {
        validationErrors: this.formatValidationErrors(validationErrors),
        totalErrors: validationErrors.length,
      },
    };

    logger.warn("formatter:logs.validation_error", {
      status: 400,
      title: response.title,
      message: response.message,
      totalErrors: validationErrors.length,
    });

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

    if (Array.isArray(errors)) {
      return errors.map((error) => ({
        field: error.field || error.path || "unknown",
        message: error.message || "formatter:validation.default_message",
        value: error.value !== undefined ? error.value : null,
        type: error.type || "validation",
      }));
    }

    if (typeof errors === "object") {
      return Object.keys(errors).map((key) => ({
        field: key,
        message:
          errors[key].message ||
          errors[key] ||
          "formatter:validation.default_message",
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
        logger.error("formatter:logs.service_error");
        return this.respuestaError(res, {
          status: 500,
          title: "formatter:error.service",
          message: "formatter:logs.service_error",
        });
      }

      if (serviceResponse.success === true) {
        return this.respuestaExito(res, serviceResponse);
      } else {
        return this.respuestaError(res, serviceResponse);
      }
    } catch (error) {
      logger.error("formatter:logs.processing_error", {
        error: error.message,
      });

      return this.respuestaError(res, {
        status: 500,
        title: "formatter:error.controller",
        message: "formatter:logs.processing_error",
        error: error.message,
      });
    }
  }

  /**
   * @static
   * @method manejarServicio
   * @description Método optimizado para manejar servicios con propagación automática
   * @param {Object} res Objeto response de Express
   * @param {Promise} servicioPromise Promesa del servicio
   * @returns {Object} Respuesta estructurada
   */
  static async manejarServicio(res, servicioPromise) {
    try {
      const resultado = await servicioPromise;
      console.log("Este es la respuesta: ", resultado);

      if (resultado === undefined || resultado === null) {
        logger.error("formatter:logs.null_result");
        return this.respuestaError(res, {
          status: 500,
          title: "formatter:error.service",
          message: "formatter:logs.null_result",
        });
      }

      if (resultado.success === false) {
        throw resultado;
      }

      return this.respuestaExito(res, resultado);
    } catch (error) {
      console.log(error);
      logger.error("formatter:logs.processing_error", {
        error: error.message,
      });
      return this.respuestaError(res, error);
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
    logger.info("formatter:logs.data_response", {
      dataType: typeof data,
      hasMetadata: Object.keys(metadata).length > 0,
    });

    return this.respuestaExito(res, {
      status: 200,
      success: true,
      message: metadata.message || "formatter:success.data_retrieved",
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
  static respuestaPaginada(res, data, pagination, message = null) {
    logger.info("formatter:logs.paged_response", {
      dataCount: data?.length || 0,
      pagination: pagination,
    });

    return this.respuestaExito(res, {
      status: 200,
      success: true,
      message: message || "formatter:success.paged_data",
      data: data,
      metadata: {
        pagination: pagination,
        title: "Datos Paginados",
      },
    });
  }
}
