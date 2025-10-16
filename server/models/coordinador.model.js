/**
 * @module CoordinadorModel
 * @description Modelo encargado exclusivamente de la interacción con la base de datos
 * para las operaciones relacionadas con los Coordinadores. Incluye asignación,
 * desasignación y listado de coordinadores.
 */

// Importaciones principales
import pg from "../database/pg.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";

export default class CoordinadorModel {
  /**
   * @static
   * @async
   * @method asignarCoordinador
   * @description Asigna un profesor como coordinador de un PNF mediante un procedimiento almacenado
   * @param {Object} params - Parámetros de entrada
   * @param {number} params.cedula_profesor - Cédula del profesor
   * @param {number} params.id_pnf - ID del PNF
   * @param {number} params.id_usuario - ID del usuario que realiza la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async asignarCoordinador({ cedula_profesor, id_pnf, id_usuario }) {
    try {
      const query = `CALL asignar_coordinador(?, ?, ?, NULL)`;
      const params = [id_usuario, cedula_profesor, id_pnf];

      const { rows } = await pg.query(query, params);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Coordinador asignado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.asignarCoordinador" };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al asignar coordinador"
      );
    }
  }

  /**
   * @static
   * @async
   * @method listarCoordinadores
   * @description Obtiene la lista de todos los coordinadores
   * @returns {Promise<Object>} Lista de coordinadores
   */
  static async listarCoordinadores() {
    try {
      const query = `SELECT * FROM public.coordinadores_informacion_completa`;
      const { rows } = await pg.query(query);

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Listado de coordinadores obtenido correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.listarCoordinadores" };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener coordinadores"
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

      return FormatResponseModel.respuestaPostgres(
        rows,
        "Coordinador desasignado correctamente"
      );
    } catch (error) {
      error.details = { path: "CoordinadorModel.desasignarCoordinador" };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al desasignar coordinador"
      );
    }
  }
}
