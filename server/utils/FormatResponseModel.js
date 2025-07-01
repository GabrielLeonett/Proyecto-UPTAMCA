// Funcion para generar reportes en caso de errores internos
import generateReport from './generateReport.js';

/**
 * @class FormatResponseModel
 * @description Clase utilitaria para estandarizar las respuestas de la API y el manejo de datos desde PostgreSQL.
 * Proporciona métodos para formatear respuestas exitosas, errores y conjuntos de datos de manera consistente.
 */
export default class FormatResponseModel {
  /**
   * @static
   * @method validacionesComunes
   * @description Realiza validaciones básicas a la respuesta de la base de datos
   * @param {Object|Array} rows - Respuesta cruda de PostgreSQL
   * @returns {Object} Datos validados y normalizados
   * @throws {Error} Si no hay datos o la respuesta es inválida
   */
  static validacionesComunes(rows) {
    try {
      if (!rows || (Array.isArray(rows) && rows.length === 0)) {
        throw new Error(
          "No se recibió respuesta del servidor de base de datos"
        );
      }

      // Maneja tanto arrays como objetos individuales
      const firstRow = Array.isArray(rows) ? rows[0] : rows;

      // Determina si es respuesta de procedimiento/función o consulta directa
      return firstRow?.p_resultado !== undefined ? firstRow.p_resultado : rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @static
   * @method respuestaError
   * @description Formatea una respuesta de error estándar
   * @param {Object|Array|null} [rows=null] - Datos de error de la BD
   * @param {string} [title='Error'] - Título descriptivo del error
   * @returns {Object} Respuesta de error formateada
   */
  static respuestaError(rows = null, title = "Error") {
    try {
      const resultado = rows ? this.validacionesComunes(rows) : {};

      if(resultado.status === undefined){
        throw resultado;
      }

      return {
        status: resultado.status_code || 400,
        state: "error",
        title: title,
        message: resultado.message || "Error en la operación",
      };
    } catch (error) {
      generateReport({
        status: 500,
        state: "error",
        title: "Error de BD",
        message: error.message,
        ...(error?.details && {details: error.details})
      });
      return {
        status: 500,
        state: "error",
        title: "Error interno en el servidor.",
        message: "Lo sentimos, Intente de nuevo mas tarde.",
      }
    }
  }

  /**
   * @static
   * @method respuestaSuccess
   * @description Formatea una respuesta con datos para el controlador
   * @param {Object|Array} [rows={}] - Conjunto de datos de la BD
   * @param {string} [title='Datos obtenidos'] - Título descriptivo
   * @returns {Object} Respuesta con datos formateados
   * @throws {Error} Si ocurre un error en el procesamiento
   */
  static respuestaSuccess(rows = {}, title = "Datos obtenidos") {
    try {
      return {
        status: rows.metadata?.status_code || 200,
        state: "success",
        title: title,
        message: rows.message,
        ...(rows?.data && { data: rows.data }),
        ...(rows?.metadata && { metadata: rows.metadata }),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @static
   * @method respuestaPostgres
   * @description Método inteligente que determina automáticamente el tipo de respuesta a formatear
   * @param {Object|Array} rows - Respuesta cruda de PostgreSQL
   * @param {string} [titleSuccess='Completado'] - Título para respuestas exitosas
   * @param {string} [titleError='Error'] - Título para respuestas de error
   * @returns {Object} Respuesta formateada según el tipo de resultado
   * @throws {Error} Si la respuesta indica un error explícito
   */
  static respuestaPostgres(rows, titleSuccess = "Completado") {
    try {
      const resultado = this.validacionesComunes(rows);

      if (resultado.status === "success") {
        return this.respuestaSuccess(resultado, titleSuccess);
      } else if (resultado.status === "error") {
        throw resultado;
      }

      return resultado;
    } catch (error) {
      throw error;
    }
  }
}
