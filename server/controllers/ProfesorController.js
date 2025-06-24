import { validationUser } from "../schemas/UserSchema.js";
import { validationProfesor } from "../schemas/ProfesorSchema.js";
import ProfesorModel from '../models/ProfesorModel.js'

export default class ProfesorController {
  static async registrarProfesor(req, res) {
    try {
      // Validación de datos del profesor
      const validationResultProfesor = validationProfesor({ input: req.body });
      if (!validationResultProfesor.success) {
        const errores = validationResultProfesor.error.errors.map(error => error.message);
        FormatResponseController.respuestaError(res, {status: 400, errores})
      }

      // Validación de datos de usuario
      const validationResultUser = validationUser({ input: req.body });
      if (!validationResultUser.success) {
        const errores = validationResultUser.error.errors.map(error => error.message);
        FormatResponseController.respuestaError(res, {status: 400, errores})
      }
      
      // Registrar profesor
      const result = await ProfesorModel.RegisterProfesor({ datos: req.body, usuario_accion: req.user });

      return res.status(result.status).json(result);

      
    } catch (error) {
      return res.status(error.status).json(error);
    }
  }

  static async mostrarProfesorAPI(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesorAPI({datos: req.query})

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
    }
  }

  static async mostrarProfesor(req, res) {
    try {
      const result = await ProfesorModel.mostrarProfesor({datos: req.query})

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
    }
  }

  static async buscarProfesor(req, res){
    try {
      const result = await ProfesorModel.buscarProfesor({datos: req.body})

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la lista de profesores',
        error: error.message
      });
    }
  }
}
