/**
 * @module CoordinadorModel
 * @description Modelo encargado exclusivamente de la interacción con la base de datos
 * para las operaciones relacionadas con los Coordinadores. Incluye asignación,
 * desasignación, listado, obtención, actualización y eliminación de coordinadores.
 */

// Importaciones principales
import pg from "../database/pg.js";
import FormatterResponseModel from "../utils/FormatterResponseModel.js";

export default class CoordinadorModel {
  /**
   * @static
   * @async
   * @method asignarCoordinador
   * @description Asigna un profesor como coordinador de un PNF mediante un procedimiento almacenado
   * @param {Object} datos - Datos de asignación del coordinador
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async asignarCoordinador(datos, id_usuario) {
    try {
      const query = `CALL asignar_coordinador(?, ?, ?, NULL)`;
      const params = [id_usuario, datos.cedula_profesor, datos.id_pnf];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador asignado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.asignarCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al asignar coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method listarCoordinadores
   * @description Obtiene la lista de todos los coordinadores con soporte para parámetros de consulta
   * @param {Object} queryParams - Parámetros de consulta (paginación, filtros, ordenamiento)
   * @returns {Promise<Object>} Lista de coordinadores
   */
  static async listarCoordinadores(queryParams = {}) {
    try {
      let query = `SELECT * FROM public.coordinadores_informacion_completa WHERE 1=1`;
      const params = [];

      // Aplicar filtros si están presentes
      if (queryParams.activo !== undefined) {
        query += ` AND activo = ?`;
        params.push(queryParams.activo);
      }

      if (queryParams.id_pnf) {
        query += ` AND id_pnf = ?`;
        params.push(queryParams.id_pnf);
      }

      // Aplicar ordenamiento
      if (queryParams.sort) {
        const allowedSortFields = ['nombres', 'apellidos', 'nombre_pnf', 'fecha_inicio'];
        const sortField = allowedSortFields.includes(queryParams.sort) ? queryParams.sort : 'nombres';
        const sortOrder = queryParams.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      } else {
        query += ` ORDER BY nombres ASC`;
      }

      // Aplicar paginación
      if (queryParams.limit) {
        const limit = parseInt(queryParams.limit);
        const offset = queryParams.page ? (parseInt(queryParams.page) - 1) * limit : 0;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Listado de coordinadores obtenido correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.listarCoordinadores" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener coordinadores"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerCoordinador
   * @description Obtiene un coordinador específico por su cédula
   * @param {number} cedula - Cédula del coordinador
   * @returns {Promise<Object>} Datos del coordinador
   */
  static async obtenerCoordinador(cedula) {
    try {
      const query = `
        SELECT * FROM public.coordinadores_informacion_completa 
        WHERE cedula = ?
      `;
      const params = [cedula];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador obtenido correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.obtenerCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerCoordinadorPorId
   * @description Obtiene un coordinador específico por su ID de coordinador
   * @param {number} id_coordinador - ID del coordinador
   * @returns {Promise<Object>} Datos del coordinador
   */
  static async obtenerCoordinadorPorId(id_coordinador) {
    try {
      const query = `
        SELECT * FROM public.coordinadores_informacion_completa 
        WHERE id_coordinador = ?
      `;
      const params = [id_coordinador];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador obtenido correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.obtenerCoordinadorPorId" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener coordinador por ID"
      );
    }
  }

  /**
   * @static
   * @async
   * @method actualizarCoordinador
   * @description Actualiza los datos de un coordinador existente
   * @param {number} id_coordinador - ID del coordinador a actualizar
   * @param {Object} datos - Datos actualizados del coordinador
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async actualizarCoordinador(id_coordinador, datos, id_usuario) {
    try {
      // Construir la consulta dinámicamente basada en los campos proporcionados
      const campos = [];
      const params = [];

      // Campos permitidos para actualización
      const camposPermitidos = [
        'fecha_inicio', 'fecha_fin', 'observaciones', 
        'estado', 'motivo_destitucion'
      ];

      for (const [campo, valor] of Object.entries(datos)) {
        if (camposPermitidos.includes(campo) && valor !== undefined) {
          campos.push(`${campo} = ?`);
          params.push(valor);
        }
      }

      if (campos.length === 0) {
        return FormatterResponseModel.respuestaPostgres(
          [],
          "No hay campos válidos para actualizar"
        );
      }

      // Agregar ID del coordinador y usuario que actualiza
      params.push(id_coordinador, id_usuario);

      const query = `
        UPDATE public.coordinadores 
        SET ${campos.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP, id_usuario_actualizacion = ?
        WHERE id_coordinador = ?
      `;

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador actualizado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.actualizarCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al actualizar coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method eliminarCoordinador
   * @description Elimina (destituye) un coordinador mediante un procedimiento almacenado
   * @param {number} id_coordinador - ID del coordinador a eliminar
   * @param {number} id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async eliminarCoordinador(id_coordinador, id_usuario) {
    try {
      const query = `CALL desasignar_coordinador(?, ?, ?, NULL)`;
      const params = [id_usuario, id_coordinador, 'Destitución por usuario del sistema'];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador eliminado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.eliminarCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al eliminar coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method desasignarCoordinador
   * @description Desasigna un coordinador de su PNF mediante un procedimiento almacenado
   * @param {Object} params - Parámetros de entrada
   * @param {number} params.id_coordinador - ID del coordinador
   * @param {number} params.id_usuario - ID del usuario que realiza la desasignación
   * @param {string} [params.motivo] - Motivo de la desasignación
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async desasignarCoordinador({ id_coordinador, id_usuario, motivo }) {
    try {
      const query = `CALL desasignar_coordinador(?, ?, ?, NULL)`;
      const params = [id_usuario, id_coordinador, motivo];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Coordinador desasignado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.desasignarCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al desasignar coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method verificarCoordinadorActivo
   * @description Verifica si un coordinador está activo en un PNF específico
   * @param {number} cedula_profesor - Cédula del profesor
   * @param {number} id_pnf - ID del PNF
   * @returns {Promise<Object>} Información sobre la coordinación activa
   */
  static async verificarCoordinadorActivo(cedula_profesor, id_pnf) {
    try {
      const query = `
        SELECT * FROM public.coordinadores_informacion_completa 
        WHERE cedula = ? AND id_pnf = ? AND activo = true
      `;
      const params = [cedula_profesor, id_pnf];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Verificación de coordinador activo completada"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.verificarCoordinadorActivo" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al verificar coordinador activo"
      );
    }
  }

  /**
   * @static
   * @async
   * @method obtenerHistorialCoordinador
   * @description Obtiene el historial completo de coordinaciones de un profesor
   * @param {number} cedula_profesor - Cédula del profesor
   * @returns {Promise<Object>} Historial de coordinaciones
   */
  static async obtenerHistorialCoordinador(cedula_profesor) {
    try {
      const query = `
        SELECT * FROM public.coordinadores_informacion_completa 
        WHERE cedula = ? 
        ORDER BY fecha_inicio DESC
      `;
      const params = [cedula_profesor];

      const { rows } = await pg.query(query, params);

      return FormatterResponseModel.respuestaPostgres(
        rows,
        "Historial de coordinador obtenido correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.obtenerHistorialCoordinador" };
      throw FormatterResponseModel.respuestaError(
        error,
        "Error al obtener historial de coordinador"
      );
    }
  }
}