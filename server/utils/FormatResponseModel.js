export default class FormatResponseModel {
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

  static respuestaError(rows = null, title = 'Error') {
    try {
      const resultado = rows ? this.validacionesComunes(rows) : {};

      return {
        status: 400 || resultado.status_code , // Código HTTP para bad request
        state: 'error',
        title: title,
        message: resultado.message || 'Error en la operación',
      };
    } catch (error) {
      return {
        status: 500 || resultado.status_code,
        state: 'error',
        title: 'Error de BD',
        message: 'Error al procesar respuesta de BD',
      };
    }
  }

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