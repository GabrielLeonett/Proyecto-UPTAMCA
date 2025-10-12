// Funcion para generar reportes en caso de errores internos
import generateReport from "./generateReport.js";

/**
 * @class FormatResponseController
 * @description Maneja las posibles respuestas que dará el controlador
 * @author Gabriel Leonett
 */
export default class FormatResponseController {
  /**
   * @static
   * @method respuestaExito
   * @description Devuelve una respuesta exitosa estructurada
   * @param {Object} res Objeto response de Express
   * @param {Object} respuestaDatos Objeto con los datos para la respuesta
   * @param {number} [respuestaDatos.status=200] Código HTTP (default: 200)
   * @param {string} [respuestaDatos.title='Excelente'] Titulo descriptivo
   * @param {string} [respuestaDatos.message='Operación exitosa'] Mensaje descriptivo
   * @param {Object} [respuestaDatos.data] Datos a enviar en la respuesta
   * @param {Object} [respuestaDatos.metadata] Metadatos adicionales
   * @returns {Object} Respuesta estructurada
   */
  static respuestaExito(res, respuestaDatos = {}) {
    try {
      const response = {
        success: true,
        title: respuestaDatos.title || "Excelente",
        status: respuestaDatos.status || 200,
        message: respuestaDatos.message || "Operación exitosa",
        data: respuestaDatos.data || null,
        error: null,
      };

      if (respuestaDatos.metadata) {
        response.metadata = respuestaDatos.metadata;
      }

      return res.status(response.status).json(response);
    } catch (error) {
      return this.respuestaError(res, {
        status: 500,
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
   * @param {Object} respuestaDatos Objeto con los datos para la respuesta
   * @param {number} [respuestaDatos.status=500] Código HTTP
   * @param {string} [respuestaDatos.title='Error'] Titulo descriptivo
   * @param {string} [respuestaDatos.message='Error interno'] Mensaje descriptivo
   * @param {Object} [respuestaDatos.error] Detalles del error
   * @returns {Object} Respuesta de error estructurada
   */
  static respuestaError(res, respuestaDatos = {}) {
    try {
      if (respuestaDatos.status === undefined) {
        throw respuestaDatos;
      }

      const status = respuestaDatos.status || 400;
      const response = {
        success: false,
        status,
        title: respuestaDatos.title,
        message: respuestaDatos.message || "Error interno",
        data: null,
        error: respuestaDatos.error || null,
        type: respuestaDatos.state || "error",
      };
      console.log(response)
      return res.status(status).json(response);
    } catch (internalError) {
      // Fallback para errores en el manejador de errores
      generateReport({
        status: 500,
        state: "critical",
        title: "Error en el manejador de errores",
        message: internalError.message,
        stack: internalError.stack,
      });

      return res.status(500).json({
        success: false,
        status: 500,
        message: "Error interno en el servidor",
        data: null,
        error: null, // No exponer detalles internos
      });
    }
  }

  /**
   * @static
   * @method respuestaDatos
   * @description Versión simplificada de respuesta exitosa (solo datos)
   * @param {Object} res Objeto response de Express
   * @param {Object} data Datos a enviar en la respuesta
   * @param {Object} [metadata] Metadatos adicionales
   * @returns {Object} Respuesta estructurada
   */
  static respuestaDatos(res, data, metadata) {
    return this.respuestaExito(res, {
      status: 200,
      success: true,
      message: "",
      data,
      metadata,
    });
  }
}
