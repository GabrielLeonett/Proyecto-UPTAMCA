// Importación de librería para envío de correos electrónicos
import { enviarEmail } from "../utils/EnviarCorreos.js";

// Importación de la conexión a la base de datos
import db from "../database/db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class SedeModel
 * @description Contiene los metodos para todo lo que tiene que ver con sedes
 */

export default class SedeModel {
    static async registerSede({usuarioAccion, data}) {
        const { nombreSede, UbicacionSede, GoogleSede } = data;
        try {
            const idSede = await db.raw("SELECT COUNT(*) + 1 AS id FROM sedes"); 
            const {rows} = await db.raw("CALL public.registrar_sede_completo(?, ?, ?, ?, ?, NULL)", [usuarioAccion, idSede.rows[0].id, nombreSede, UbicacionSede, GoogleSede]);

            return FormatResponseModel.respuestaPostgres(rows, 'Sede registrada exitosamente');
        } catch (error) {
            error.path = "SedesModel.registerSede";
            throw FormatResponseModel.respuestaError(error, 'Error al registrar la sede');
        }
    }
    static async mostrarSedes() {
        try {
            const {rows} = await db.raw("SELECT id_sede, nombre_sede, ubicacion_sede, google_sede FROM sedes"); 

            return FormatResponseModel.respuestaPostgres(rows, 'Sedes exitosamente');
        } catch (error) {
            error.path = "SedesModel.mostrarSedes";
            throw FormatResponseModel.respuestaError(error, 'Error mostrar las sedes');
        }
    }
}
