import CurricularModel from "../models/CurricularModel.js";

//Importaciones de los esquemas para las validaciones
import { validationPNF } from "../schemas/PnfSchema.js";
import { validationUnidadCurricular } from "../schemas/UnidadCurricularSchema.js";

export default class CurricularController {
  static async regitrarPNF(req, res) {
    try {
      //Validacion de los datos para el PNF
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
      });

      return res.status(201).json({
        success: true,
        message: respuestaModel.message,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }

  static async regitrarUnidadCurricular(req, res) {
    try {
      //Validacion de los datos para el UnidadCurricular
      const resultadoValidation = validationUnidadCurricular({ input: req.body });
      if (!resultadoValidation.success) {
        const errores = resultadoValidation.error.errors;
        return res.status(400).json({
          success: false,
          errors: errores,
          message: "Error de validación en los datos del profesor",
        });
      }

      const respuestaModel = await CurricularModel.registrarUnidadCurricular({datos: req.body});

      return res.status(201).json({
        success: true,
        message: respuestaModel.message,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }
  static async mostrarPNF(req, res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json({
        success: true,
        data: respuestaModel.data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }
  static async mostrarTrayectos(req, res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json({
        success: true,
        data: respuestaModel.data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }
  static async mostrarUnTrayecto(req, res) {
    try {
      const respuestaModel = await CurricularModel.mostrarPNF();
      return res.status(201).json({
        success: true,
        data: respuestaModel.data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el PNF, por favor vuelva a intentarlo",
      });
    }
  }
}
