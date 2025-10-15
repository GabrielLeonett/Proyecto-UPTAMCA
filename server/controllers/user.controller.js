import UserService from "../services/user.service.js";
import NotificationService from "../services/notification.service.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * @class UserController
 * @description Controlador para gestionar las operaciones relacionadas con usuarios
 */
export default class UserController {
  /**
   * @name login
   * @description Maneja el proceso de inicio de sesión de un usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async login(req, res) {
    try {
      const respuesta = await UserService.login(req.body);
      
      // Para login manejamos la cookie directamente
      res
        .cookie("autorization", respuesta.token, {
          maxAge: 1000 * 60 * 60 * 24, // 1 día
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .status(200)
        .json({
          status: "success",
          message: "Inicio de sesión exitoso",
          data: respuesta.userData,
        });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name verificarUsers
   * @description Verifica si el usuario tiene una sesión activa válida
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async verificarUsers(req, res) {
    try {
      const { user } = req;
      FormatResponseController.respuestaExito(res, user);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name closeSession
   * @description Cierra la sesión del usuario eliminando la cookie
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async closeSession(req, res) {
    try {
      res.clearCookie("autorization", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      FormatResponseController.respuestaExito(res, {
        message: "Sesión cerrada exitosamente"
      });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name cambiarContraseña
   * @description Maneja el proceso de cambio de contraseña
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async cambiarContraseña(req, res) {
    try {
      const respuesta = await UserService.cambiarContraseña(
        req.body, 
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name enviarNotificacion
   * @description Obtiene las notificaciones del usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async enviarNotificacion(req, res) {
    try {
      const { user } = req;
      const { 
        soloNoLeidas = "true", 
        limite = "30", 
        fechaDesde = null, 
        ultimaConexion = null 
      } = req.query;

      const respuesta = await NotificationService.obtenerNotificacionesUsuario({
        usuario: user,
        opciones: {
          soloNoLeidas: soloNoLeidas === "true",
          limite: parseInt(limite),
          fechaDesde: fechaDesde || ultimaConexion,
        }
      });
      
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
}