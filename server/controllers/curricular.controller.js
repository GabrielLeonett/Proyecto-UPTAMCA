import CurricularModel from "../models/curricular.model.js";

// Importaciones de los esquemas para las validaciones
import { validationPartialPNF, validationPNF } from "../schemas/PnfSchema.js";
import {
  validationPartialSeccion,
  validationSeccion,
} from "../schemas/SeccionSchema.js";
import {
  validationPartialUnidadCurricular,
  validationUnidadCurricular,
} from "../schemas/UnidadCurricularSchema.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * @class CurricularController
 * @description Controlador para gestionar las operaciones relacionadas con:
 * - Programas Nacionales de Formación (PNF)
 * - Unidades Curriculares
 * - Trayectos académicos
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
      const validaciones = validationErrors(validationPNF({ input: req.body }));
      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 400,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
          state: "validation_error",
        });
        return;
      }

      const respuestaModel = await CurricularModel.registrarPNF({
        datos: req.body,
        usuario_accion: req.user,
      });

      FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
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
      const validaciones = validationErrors(
        validationUnidadCurricular({ input: req.body })
      );

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 402,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }

      const respuestaModel = await CurricularModel.registrarUnidadCurricular({
        datos: req.body,
        usuario_accion: req.user,
      });

      FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
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
  static async mostrarPNF(req, res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
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
  static async mostrarTrayectos(req, res) {
    try {
      //Inicializa el codigo de un pnf si llego en la query de la url
      const codigoPNF = req.query.PNF;

      //Si no es undefiend
      if (codigoPNF !== undefined) {
        //hace las validaciones respectivas
        const validaciones = validationErrors(
          validationPartialPNF({ input: { codigoPNF: codigoPNF } })
        );
        if (validaciones !== true) {
          //Si la validacion da un error, lo devuelve al usuario
          FormatResponseController.respuestaError(res, {
            status: 402,
            title: "Datos Erroneos",
            message: "Los datos estan errados",
            error: validaciones,
          });
          return;
        }
      }
      const respuestaModel = await CurricularModel.mostrarTrayectos(codigoPNF);
      FormatResponseController.respuestaExito(res, respuestaModel);
      return;
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method mostrarUnidadesCurriculares
   * @description Obtiene todas las unidades curriculares de un trayecto por su id
   * @param {object} req - Objeto de solicitud de Express
   * @param {object} req.trayecto - Id del trayecto que se desea consultar sus secciones
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de trayectos
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarUnidadesCurriculares(req, res) {
    try {
      //Inicializa el codigo de un pnf si llego en la query de la url
      const idTrayecto = req.query.Trayecto ? Number(req.query.Trayecto) : null;
      //hace las validaciones respectivas
      const validaciones = validationErrors(
        validationPartialUnidadCurricular({ input: { idTrayecto: idTrayecto } })
      );
      if (validaciones !== true) {
        //Si la validacion da un error, lo devuelve al usuario
        FormatResponseController.respuestaError(res, {
          status: 402,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }
      const respuestaModel = await CurricularModel.mostrarUnidadesCurriculares(
        idTrayecto
      );
      FormatResponseController.respuestaExito(res, respuestaModel);
      return;
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method mostrarSeccion
   * @description Obtiene todos las secciones del trayecto al que pertenecen
   * @param {object} req - Objeto de solicitud de Express
   * @param {object} req.trayecto - Id del trayecto que se desea consultar sus secciones
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de trayectos
   * @throws {500} Si ocurre un error en el servidor
   */
  static async mostrarSecciones(req, res) {
    try {
      //Inicializa el codigo de un pnf si llego en la query de la url
      const idTrayecto = req.query.Trayecto ? Number(req.query.Trayecto) : null;
      //hace las validaciones respectivas
      const validaciones = validationErrors(
        validationPartialUnidadCurricular({ input: { idTrayecto: idTrayecto } })
      );
      if (validaciones !== true) {
        //Si la validacion da un error, lo devuelve al usuario
        FormatResponseController.respuestaError(res, {
          status: 402,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }
      const respuestaModel = await CurricularModel.mostrarSecciones(idTrayecto);
      FormatResponseController.respuestaExito(res, respuestaModel);
      return;
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method CrearSecciones
   * @description Crear las secciones para un trayecto de forma automatica
   * @param {object} req - Objeto de solicitud de Express
   * @param {object} req.trayecto - Id del trayecto que se desea consultar sus secciones
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de trayectos
   * @throws {500} Si ocurre un error en el servidor
   */
  static async CrearSecciones(req, res) {
    try {
      const idTrayecto = Number(req.params.idTrayecto) || null;
      const poblacionEstudiantil = req.body.poblacionEstudiantil || null;
      const Datos = {
        idTrayecto: idTrayecto,
        poblacionEstudiantil: poblacionEstudiantil,
      };
      const validaciones = validationErrors(
        validationPartialSeccion({ input: Datos })
      );
      if (validaciones !== true) {
        //Si la validacion da un error, lo devuelve al usuario
        FormatResponseController.respuestaError(res, {
          status: 402,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }

      const respuestaModel = await CurricularModel.CrearSecciones(Datos);
      FormatResponseController.respuestaExito(res, respuestaModel);
      return;
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method asignacionTurnoSeccion
   * @description Asignar un turno a una sección especifica
   * @param {object} req - Objeto de solicitud de Express
   * @param {object} req.trayecto - Id del trayecto que se desea consultar sus secciones
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta JSON con lista de trayectos
   * @throws {500} Si ocurre un error en el servidor
   */
  static async asignacionTurnoSeccion(req, res) {
    try {
      const validaciones = validationErrors(
        validationPartialSeccion({ input: req.body })
      );

      if (validaciones !== true) {
        //Si la validacion da un error, lo devuelve al usuario
        FormatResponseController.respuestaError(res, {
          status: 402,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
        return;
      }

      const respuestaModel = await CurricularModel.asignacionTurnoSeccion(
        req.user,
        req.body
      );
      FormatResponseController.respuestaExito(res, respuestaModel);
      return;
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}
