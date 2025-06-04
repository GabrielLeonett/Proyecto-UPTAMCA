import { validationHorario } from "../schemas/HorarioSchema.js";
import HorarioModel from '../models/HorarioModel.js'

export default class HorarioController {
  static async registrarHorario(req, res) {
    try {
      console.log(req.body)
      //Validacion de los datos para el UnidadCurricular
      const resultadoValidation = validationHorario({ input: req.body });
      if (!resultadoValidation.success) {
        const errores = resultadoValidation.error.errors;
        return res.status(400).json({
          success: false,
          errors: errores,
          message: "Error de validación en los datos del Horario",
        });
      }

      const respuestaModel = await HorarioModel.registrarHorario({datos: req.body});

      return res.status(201).json({
        success: true,
        message: respuestaModel.message,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        menssage:
          error || "Error al registrar el Horario, por favor vuelva a intentarlo",
      });
    }
  }
}
