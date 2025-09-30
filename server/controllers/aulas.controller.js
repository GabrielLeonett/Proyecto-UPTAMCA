// Importación de clase para formateo de respuestas
import FormatResponseController from "../utils/FormatResponseController.js";
import validationErrors from "../utils/validationsErrors.js";
import AulaModel from "../models/aulas.model.js";
import {
  validationAula,
  validationPartialAula,
} from "../schemas/AulaSchema.js";

/**
 * @class AulaController
 * @description Contiene los metodos para todo lo que tiene que ver con sedes
 */

export default class AulaController {
  static async registerAula(req, res) {
    try {
      // Validación de datos del profesor usando el esquema definido
      let validaciones = validationErrors(validationAula({ input: req.body }));

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }
      const usuarioAccion = req.user;

      const responseModel = await AulaModel.registerAula(usuarioAccion, {...req.body});

      console.log(responseModel)
      FormatResponseController.respuestaExito(res, responseModel);
    } catch (error) {
      error.path = "AulasModel.registerAula";
      FormatResponseController.respuestaError(res, error);
    }
  }
  static async mostrarAulas(req, res) {
    try {
      const responseModel = await AulaModel.mostrarAulas();

      FormatResponseController.respuestaExito(res, responseModel);
    } catch (error) {
      error.path = "AulasModel.mostrarAulas";
      FormatResponseController.respuestaError(res, error);
    }
  }
}
