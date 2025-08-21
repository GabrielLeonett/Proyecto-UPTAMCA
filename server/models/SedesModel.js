// Importación de librería para envío de correos electrónicos
import { enviarEmail } from "../utils/EnviarCorreos.js";

// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class SedeModel
 * @description Contiene los metodos para todo lo que tiene que ver con sedes
 */

export default class SedeModel {
    static async registerSede({nombreSede, UbicacionSede, GoogleSede}) {
        const resultado = await db.raw('SELECT id_sede FROM sedes GROUP BY DESC LIMIT 1;');
        const id_sede = resultado.rows[0].id_sede + 1;
        const { rows } = await db.raw('',)
    }
}
