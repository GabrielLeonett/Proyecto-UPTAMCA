/*
Importacion de la clase para el formateo de los datos que se reviven de la BD y 
procesamiento para devorlver al controlador el resultado.
*/ 
import FormatResponseModel from '../utils/FormatResponseModel.js'
//Importacion de la conexion con la base de datos
import db from "../db.js";

export default class UserModel {
  static async loginUser({ email }) {
    try {
      const query = "SELECT MOSTRAR_USUARIO(?)";
      const values = [email];

      const { rows } = await db.raw(query, values);
      const resultado = FormatResponseModel.respuestaDatos(rows[0].mostrar_usuario, 'Usuario Obtenido')
      return resultado
    } catch (error) {
      throw FormatResponseModel.respuestaError(error, 'Error al obtener el usuario')
    }
  }
}
