import CurricularModel from "../models/CurricularModel.js";

// Importaciones de los esquemas para las validaciones
import { validationPNF } from "../schemas/PnfSchema.js";
import { validationUnidadCurricular } from "../schemas/UnidadCurricularSchema.js";

/**
 * @class CurricularController
 * @description Controlador para gestionar las operaciones relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Unidades Curriculares
 * - Trayectos académicos
 * 
 * Maneja la validación de datos, interacción con el modelo y respuestas HTTP.
 */
export default class CurricularController {
  
  /**
   * @static
   * @async
   * @method regitrarPNF
   * @description Registra un nuevo Programa Nacional de Formación (PNF)
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} req.body - Datos del PNF a registrar
   * @param {Object} req.user - Usuario que tiene la session iniciada
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con resultado de la operación
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   */
  static async regitrarPNF(req, res) {
    try {
      // Validacion de los datos para el PNF
      const resultadoValidation = validationPNF({ input: req.body });
      if (!resultadoValidation.success) {
        const errores = resultadoValidation.error.errors;
        return res.status(400).json({
          success: false,
          errors: errores,
          message: "Error de validación en los datos del profesor",
        });
      }

      const respuestaModel = await CurricularModel.registrarPNF({
        datos: req.body,
        usuario_accion: req.user
      });

      return res.status(201).json({
        success: true,
        message: respuestaModel.message,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage: error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }

  /**
   * @static
   * @async
   * @method regitrarUnidadCurricular
   * @description Registra una nueva Unidad Curricular
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} req.body - Datos de la unidad curricular
   * @param {Object} req.user - Usuario que tiene la session iniciada
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con resultado de la operación
   * @throws {400} Si la validación de datos falla
   * @throws {500} Si ocurre un error en el servidor
   */
  static async regitrarUnidadCurricular(req, res) {
    try {
      // Validacion de los datos para el UnidadCurricular
      const resultadoValidation = validationUnidadCurricular({ input: req.body });
      if (!resultadoValidation.success) {
        const errores = resultadoValidation.error.errors;
        return res.status(400).json({
          success: false,
          errors: errores,
          message: "Error de validación en los datos del profesor",
        });
      }

      const respuestaModel = await CurricularModel.registrarUnidadCurricular({
        datos: req.body, 
        usuario_accion: req.user
      });

      return res.status(201).json(respuestaModel);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  /**
   * @static
   * @async
   * @method mostrarPNF
   * @description Obtiene todos los Programas Nacionales de Formación registrados
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de PNFs
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarPNF(res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json(respuestaModel);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  /**
   * @static
   * @async
   * @method mostrarTrayectos
   * @description Obtiene todos los trayectos académicos registrados
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de trayectos
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarTrayectos(res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json(respuestaModel);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  /**
   * @static
   * @async
   * @method mostrarUnTrayecto
   * @description Obtiene un trayecto académico específico
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con datos del trayecto
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarUnTrayecto(res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json(respuestaModel);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}