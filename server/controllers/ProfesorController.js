import { validationUser } from "../schemas/UserSchema.js";
import { validationProfesor } from "../schemas/ProfesorSchema.js";
import ProfesorModel from "../models/ProfesorModel.js";

export default class ProfesorController {
  static async registrarProfesor(req, res) {
    try {
      // Validación de datos del profesor
      const validationResultProfesor = validationProfesor({ input: req.body });
      console.log(req.body);
      if (!validationResultProfesor.success) {
        const errores = validationResultProfesor.error.errors.map(error => error.message);
        return res.status(400).json({
          success: false,
          errors: errores,
          message:"Error de validación en los datos del profesor"
        });
      }

      // Validación de datos de usuario
      const validationResultUser = validationUser({ input: req.body });
      if (!validationResultUser.success) {
        const errores = validationResultUser.error.errors.map(error => error.message);
        return res.status(400).json({
          success: false,
          errors: errores,
          message: "Error de validación en los datos de usuario"
        });
      }

      // Registrar profesor
      const result = await ProfesorModel.RegisterProfesor({ datos: req.body });
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message || "Error al registrar el profesor"
        });
      }
      
      return res.status(201).json({
        success: true,
        message: "Profesor registrado exitosamente",
      });

    } catch (error) {
      console.error("Error en registrarProfesor:", error);
      
      // Distinguir entre errores de validación y errores del servidor
      const statusCode = error.name === 'ValidationError' ? 400 : 500;
      
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Error interno del servidor",
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
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
      const result = await ProfesorModel.buscarProfesor({datos: req.query})

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
