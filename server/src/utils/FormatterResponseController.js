// Funcion para generar reportes en caso de errores internos
import generateReport from "./generateReport.js";
import logger from "../config/winston.config.js"; // Importar Winston

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
        data: data,
        ...(Object.keys(cleanMetadata).length > 0 && {
          metadata: cleanMetadata,
        }),
      };

      // Incluir paginación si existe (sin duplicar en metadata)
      if (metadata.pagination) {
        response.pagination = metadata.pagination;
      }

      // Log con Winston - nivel info para respuestas exitosas
      logger.info("✅ Respuesta exitosa", {
        status: response.status,
        title: response.title,
        message: response.message,
        hasData: !!data,
        timestamp: new Date().toISOString()
      });

      return res.status(response.status).json(response);
    } catch (error) {
      // Log con Winston - nivel error
      logger.error("💥 Error al procesar respuesta exitosa", {
        error: error.message,
        stack: error.stack,
        serviceResponse: serviceResponse
      });

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
        // Log con Winston - nivel warn para errores del cliente
        logger.warn("⚠️ Error del cliente (4xx)", {
          status: serviceResponse.status,
          title: serviceResponse.title,
          message: serviceResponse.message,
          errorCode: serviceResponse.error?.code,
          timestamp: new Date().toISOString()
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
          title: serviceResponse.title || this.getDefaultTitle(status),
          message: serviceResponse.message || "Error en la solicitud",
          error: serviceResponse.error?.details || {},
        };

        return res.status(status).json(response);
      }

      // Si es una instancia de Error nativa
      if (serviceResponse instanceof Error) {
        logger.error("🔍 Error nativo capturado", {
          message: serviceResponse.message,
          stack: serviceResponse.stack,
          name: serviceResponse.name
        });

        return this.respuestaError(res, {
          status: 500,
          title: "Error Interno",
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
        // Log con Winston - nivel error para errores del servidor
        logger.error("🚨 Error del servidor (5xx)", {
          status: 500,
          title: serviceResponse.title,
          message: serviceResponse.message,
          errorCode: serviceResponse.error?.code,
          stack: serviceResponse.error?.details?.stack,
          timestamp: new Date().toISOString()
        });

        await generateReport({
          status: 500,
          state: "critical",
          title: serviceResponse.title || "Error Interno del Servidor",
          message: serviceResponse.message || "Error interno no especificado",
          stack: serviceResponse.error?.details?.stack,
          details: serviceResponse.error?.details,
          originalError: serviceResponse,
          timestamp: new Date().toISOString(),
        });

        const response = {
          success: false,
          status: 500,
          title: "Error Interno",
          message:
            "Lo sentimos, ha ocurrido un error interno. Por favor, intente más tarde.",
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
      
      // Log con Winston - nivel error para otros errores
      logger.error("❌ Error genérico del servidor", {
        status: status,
        title: serviceResponse.title,
        message: serviceResponse.message,
        errorDetails: serviceResponse.error?.details,
        timestamp: new Date().toISOString()
      });

      const response = {
        success: false,
        status: status,
        title: serviceResponse.title || this.getDefaultTitle(status),
        message: serviceResponse.message || "Error interno del servidor",
        error: serviceResponse.error.details,
      };

      return res.status(status).json(response);
    } catch (internalError) {
      // Log con Winston - nivel error para errores críticos
      logger.error("💥 ERROR CRÍTICO en respuestaError", {
        error: internalError.message,
        stack: internalError.stack,
        serviceResponse: serviceResponse,
        timestamp: new Date().toISOString()
      });

      await generateReport({
        status: 500,
        state: "critical",
        title: "Error en el manejador de errores del controlador",
        message: internalError.message,
        stack: internalError.stack,
        timestamp: new Date().toISOString(),
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

    // EXTRAER validationErrors DE FORMA MÁS ROBUSTA
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
      title: serviceResponse.title || "Error de Validación",
      message:
        serviceResponse.message || "Los datos proporcionados son inválidos",
      data: null,
      error: {
        validationErrors: this.formatValidationErrors(validationErrors),
        totalErrors: validationErrors.length,
      },
    };

    // Log con Winston - nivel warn para errores de validación
    logger.warn("📝 Error de validación", {
      status: 400,
      title: response.title,
      message: response.message,
      totalErrors: validationErrors.length,
      validationErrors: validationErrors,
      timestamp: new Date().toISOString()
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
        logger.error("❌ Servicio no devolvió respuesta válida");
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
      logger.error("💥 Error al procesar respuesta del servicio", {
        error: error.message,
        stack: error.stack
      });

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
   * @method manejarServicio
   * @description Método optimizado para manejar servicios con propagación automática
   * @param {Object} res Objeto response de Express
   * @param {Promise} servicioPromise Promesa del servicio
   * @returns {Object} Respuesta estructurada
   */
  static async manejarServicio(res, servicioPromise) {
    try {
      const resultado = await servicioPromise;
      if (resultado === undefined || resultado === null) {
        logger.error("❌ Servicio devolvió resultado nulo o indefinido");
        return this.respuestaError(res, {
          status: 500,
          title: "Error del Servicio",
          message: "El servicio no devolvió una respuesta válida",
        });
      }

      if (resultado.success === false) {
        throw resultado;
      }
      return this.respuestaExito(res, resultado);
    } catch (error) {
      logger.error("💥 Error en manejarServicio", {
        error: error.message,
        stack: error.stack
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
    // Log con Winston - nivel info para respuestas de datos
    logger.info("📊 Respuesta de datos exitosa", {
      dataType: typeof data,
      hasMetadata: Object.keys(metadata).length > 0,
      timestamp: new Date().toISOString()
    });

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
    // Log con Winston - nivel info para respuestas paginadas
    logger.info("📄 Respuesta paginada exitosa", {
      dataCount: data?.length || 0,
      pagination: pagination,
      timestamp: new Date().toISOString()
    });

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