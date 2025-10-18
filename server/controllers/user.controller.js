import UserService from "../services/user.service.js";
import FormatterResponseController from "../utils/FormatterResponseController.js";

/**
 * @class UserController
 * @description Controlador para gestionar las operaciones de autenticación y usuarios
 */
export default class UserController {
  /**
   * @name login
   * @description Iniciar sesión de usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async login(req, res) {
    try {
      const resultado = await UserService.login(req.body);

      // Configurar cookie si el login fue exitoso
      if (resultado.success) {
        res.cookie("autorization", resultado.data.token, {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
      }

      return FormatterResponseController.respuestaServicio(res, resultado);
    } catch (error) {
      console.error("Error en login controller:", error);
      return FormatterResponseController.respuestaError(res, error);
    }
  }

  /**
   * @name verificarUsers
   * @description Verificar la sesión del usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async verificarUsers(req, res) {
    return FormatterResponseController.manejarServicio(
      res,
      UserService.verificarSesion(req.user)
    );
  }

  /**
   * @name closeSession
   * @description Cerrar sesión del usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async closeSession(req, res) {
    try {
      // Limpiar cookie primero
      res.clearCookie("autorization", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      // Luego ejecutar el servicio
      const resultado = await UserService.cerrarSesion();
      return FormatterResponseController.respuestaServicio(res, resultado);
    } catch (error) {
      console.error("Error en closeSession:", error);
      return FormatterResponseController.respuestaError(res, {
        status: 500,
        title: "Error del Controlador",
        message: "Error al cerrar sesión",
        error: error.message
      });
    }
  }

  /**
   * @name cambiarContraseña
   * @description Cambiar contraseña del usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async cambiarContraseña(req, res) {
    return FormatterResponseController.manejarServicio(
      res,
      UserService.cambiarContraseña(req.body, req.user)
    );
  }

  /**
   * @name obtenerPerfil
   * @description Obtener perfil del usuario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {void}
   */
  static async obtenerPerfil(req, res) {
    return FormatterResponseController.manejarServicio(
      res,
      UserService.obtenerPerfil(req.user?.userId || req.user?.id)
    );
  }
}