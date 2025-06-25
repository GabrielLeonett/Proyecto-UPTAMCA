// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from '../utils/FormatResponseModel.js'

/**
 * @class CurricularModel
 * @description Modelo para gestionar las operaciones relacionadas con PNFs (Programas Nacionales de Formación)
 * y Unidades Curriculares en la base de datos.
 * Utiliza procedimientos almacenados para las operaciones de registro.
 */
export default class CurricularModel {
  /**
   * @static
   * @async
   * @method registrarPNF
   * @description Registra un nuevo Programa Nacional de Formación (PNF) en la base de datos
   * @param {Object} params - Objeto con los datos del PNF
   * @param {Object} params.datos - Datos del PNF a registrar
   * @param {string} params.datos.nombre_pnf - Nombre del PNF
   * @param {string} params.datos.descripcion - Descripción del PNF
   * @param {string} params.datos.ubicacionPNF - Ubicacion donde estara el PNF
   * @param {string} params.datos.codigoPNF - Código único del PNF
   * @param {object} usuario_accion - Objeto que contiene datos del usuario que realiza la accion 
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @property {string} message - Mensaje descriptivo del resultado
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla el registro
   */
  static async registrarPNF({ datos, usuario_accion }) {
    try {
      //Desestructuracion de los datos para el registro del pnf
      const { nombre_pnf, descripcion, codigoPNF, ubicacionPNF} = datos;

      const query = `CALL public.registrar_pnf_completo(?, ?, ?, ?, ?, NULL)`;

      const param = [usuario_accion.id, nombre_pnf, descripcion, codigoPNF, ubicacionPNF]
      
      console.log(param)

      const { rows } = await db.raw(query, param);

      const resultado = FormatResponseModel.respuestaPostgres(rows, 'PNF registrado exitoxamente', 'Error en el registro PNF');

      return resultado;
    } catch (error) {
      console.log(error)
      throw error || "Error al registrar el PNF";
    }
  }

  /**
   * @static
   * @async
   * @method registrarUnidadCurricular
   * @description Registra una nueva Unidad Curricular en la base de datos
   * @param {Object} params - Objeto con los datos de la Unidad Curricular
   * @param {Object} params.datos - Datos de la Unidad Curricular
   * @param {number} params.datos.id_trayecto - ID del trayecto al que pertenece
   * @param {string} params.datos.nombre_unidad - Nombre de la unidad curricular
   * @param {string} params.datos.descripcion_unidad - Descripción de la unidad
   * @param {number} params.datos.carga_horas_unidad - Carga horaria en horas
   * @param {string} params.datos.codigo_unidad - Código único de la unidad
   * @param {object} usuario_accion - Objeto que contiene datos del usuario que realiza la accion 
   * @returns {Promise<Object>} Objeto con el resultado de la operación
   * @property {string} message - Mensaje descriptivo del resultado
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla el registro
   */
  static async registrarUnidadCurricular({ datos, usuario_accion }) {
    try {
      const { id_trayecto, nombre_unidad, descripcion_unidad, carga_horas_unidad, codigo_unidad } = datos;

      const query = `CALL public.registrar_unidad_curricular_completo(?, ?, ?, ?, ?, ?, NULL)`;

      const param = [usuario_accion.id, id_trayecto, nombre_unidad, descripcion_unidad, carga_horas_unidad, codigo_unidad]

      const { rows } = await db.raw(query, param);

      return FormatResponseModel.respuestaPostgres(rows, 'Unidad Curricular registrada', 'Error al registrar la Unidad Curricular')

    } catch (error) {
      throw FormatResponseModel.respuestaError(error, 'Error al registrar la Unidad Curricular')
    }
  }

  /**
   * @static
   * @async
   * @method mostrarPNF
   * @description Obtiene todos los PNFs registrados en la base de datos
   * @returns {Promise<Object>} Objeto con el resultado de la consulta
   * @property {Array} data - Lista de todos los PNFs registrados
   * @property {boolean} success - Indica si la operación fue exitosa
   * @throws {string} Error si falla la consulta
   */
  static async mostrarPNF() {
    try {
      const { rows } = await db.raw(`SELECT * FROM pnfs`);
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'PNFs obtenidos', 'Error al obtener los PNFs')
      return resultado
    } catch (error) {
      throw FormatResponseModel.respuestaError(rows, 'Error al obtener los PNFs')
    }
  }
}