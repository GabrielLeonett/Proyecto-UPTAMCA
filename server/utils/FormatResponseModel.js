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
        throw new Error("No se recibió respuesta del servidor de base de datos");
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
   * @method respuestaSuccess
   * @description Formatea una respuesta exitosa estándar
   * @param {Object|Array} [rows={}] - Datos de respuesta de la BD
   * @param {string} [title='Completado'] - Título descriptivo de la operación
   * @returns {Object} Respuesta formateada con estructura estándar
   * @throws {Error} Si ocurre un error en el procesamiento
   */
  static respuestaSuccess(rows = {}, title = 'Completado') {
    try {
      const resultado = this.validacionesComunes(rows);
      
      if (resultado.status && resultado.status !== 'success') {
        return this.respuestaError(resultado);
      }

      return {
        status: 200 || resultado.status_code,
        state: 'success',
        title: title,
        message: resultado.message || 'Operación exitosa',
      };
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
  static respuestaError(rows = null, title = 'Error') {
    try {
      const resultado = rows ? this.validacionesComunes(rows) : {};

      return {
        status: 400 || resultado.status_code,
        state: 'error',
        title: title,
        message: resultado.message || 'Error en la operación',
      };
    } catch (error) {
      return {
        status: 500,
        state: 'error',
        title: 'Error de BD',
        message: 'Error al procesar respuesta de BD',
      };
    }
  }

  /**
   * @static
   * @method respuestaDatos
   * @description Formatea una respuesta con datos para el cliente
   * @param {Object|Array} [rows={}] - Conjunto de datos de la BD
   * @param {string} [title='Datos obtenidos'] - Título descriptivo
   * @returns {Object} Respuesta con datos formateados
   * @throws {Error} Si ocurre un error en el procesamiento
   */
  static respuestaDatos(rows = {}, title = 'Datos obtenidos') {
    try {
      const resultado = this.validacionesComunes(rows);
      
      return {
        status: 200 || resultado.status_code,
        state: 'success',
        title: title,
        data: resultado.data || resultado,
        ...(resultado.message && { message: resultado.message }),
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
  static respuestaPostgres(rows, titleSuccess = 'Completado', titleError = 'Error') {
    try {
      const resultado = this.validacionesComunes(rows);

      if (resultado.status === 'success') {
        return this.respuestaSuccess(resultado, titleSuccess);
      } else if (resultado.status === 'error') {
        throw resultado;
      }
      
      // Si no tiene status, asumimos que es un conjunto de datos
      return this.respuestaDatos(resultado, titleSuccess);
    } catch (error) {
      throw error;
    }
  }
}