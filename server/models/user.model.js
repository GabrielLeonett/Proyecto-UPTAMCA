/*
Importación de la clase para el formateo de los datos que se reciben de la BD y
su procesamiento para devolver al controlador un resultado estandarizado.
*/
import FormatResponseModel from '../utils/FormatResponseModel.js'

// Importación de la conexión con la base de datos
import db from "../db.js";

/**
 * @class UserModel
 * @description Esta clase se encarga de interactuar con la base de datos para las operaciones relacionadas con usuarios,
 * proporcionando una capa de abstracción entre el controlador y la base de datos.
 * Maneja el formato de las respuestas para mantener consistencia en la API.
 */

export default class UserModel {
  /**
   * @static
   * @async
   * @method loginUser
   * @description Busca un usuario en la base de datos por su email y devuelve sus datos formateados.
   * Utiliza una función almacenada en la BD (MOSTRAR_USUARIO) para obtener la información.
   * @param {Object} params - Objeto que contiene los parámetros de búsqueda
   * @param {string} params.email - Email del usuario a buscar
   * @returns {Promise<Object>} Objeto formateado con el resultado de la consulta:
   *   - Si es exitoso: { state: "success", data: { usuario }, message: "Usuario Obtenido" }
   *   - Si falla: { state: "error", message: "Error al obtener el usuario", error: detalles }
   * @throws {Error} Cuando ocurre un error en la consulta a la base de datos
   */
  static async loginUser({ email }) {
    try {
      // Consulta SQL que llama a la función almacenada MOSTRAR_USUARIO
      const query = "SELECT MOSTRAR_USUARIO(?) AS p_resultado";
      // Valores para la consulta preparada (email del usuario)
      const values = [email];
      
      // Ejecución de la consulta en la base de datos
      const { rows } = await db.raw(query, values);

      // Formateo de la respuesta utilizando el modelo estándar
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'Usuario Obtenido');
      
      return resultado;
    } catch (error) {
      error.details = {
        path: 'UserModel.loginUser'
      }
      // Formateo del error utilizando el modelo estándar
      throw FormatResponseModel.respuestaError(
        error, 
        'Error al obtener el usuario'
      );
    }
  }
}