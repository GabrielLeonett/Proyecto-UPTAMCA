
// Importación de clase para formateo de respuestas
import FormatResponseController from "../utils/FormatResponseController.js";
import validationErrors from "../utils/validationsErrors.js";
import SedeModel from "../models/SedesModel.js";
import { validationSede, validationPartialSede } from "../schemas/SedeSchema.js";

/**
 * @class SedeController
 * @description Contiene los metodos para todo lo que tiene que ver con sedes
 */

export default class SedeController {
    static async registerSede(req, res) {
        try {
            // Validación de datos del profesor usando el esquema definido
            let validaciones = validationErrors(validationSede({ input: req.body }));

            if (validaciones !== true) {
                FormatResponseController.respuestaError(res, {
                    status: 401,
                    title: "Datos Erroneos",
                    message: "Los datos estan errados",
                    error: validaciones,
                });
                return
            }
            const usuarioAccion = req.user.id;

            const responseModel = await SedeModel.registerSede({ usuarioAccion, data: req.body });

            console.log(responseModel);

            FormatResponseController.respuestaExito(res, responseModel);
        } catch (error) {
            error.path = "SedesModel.registerSede";
            FormatResponseController.respuestaError(res, error);
        }
    }
    static async mostrarSedes(req, res) {
        try {
            const responseModel = await SedeModel.mostrarSedes();

            FormatResponseController.respuestaExito(res, responseModel);
        } catch (error) {
            error.path = "SedesModel.mostrarSedes";
            FormatResponseController.respuestaError(res, error);
        }
    }
}
