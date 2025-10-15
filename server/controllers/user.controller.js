import { validationPartialUser } from "../schemas/UserSchema.js";
import { validationContraseña } from "../schemas/ContraseñaSchema.js";
import UserModel from "../models/user.model.js";
import { comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";
import NotificationService from "../services/notification.service.js";

/**
 * @class UserController
 * @description Esta clase se encarga de gestionar las operaciones relacionadas con los usuarios,
 * incluyendo el inicio de sesión y la verificación de la sesión actual.
 */

const { loginUser, cambiarContraseña } = UserModel;

export default class UserController {
  /**
   * @static
   * @async
   * @method login
   * @description Maneja el proceso de inicio de sesión de un usuario.
   * Valida las credenciales, verifica la contraseña y crea una sesión.
   * @param {Object} req - Objeto de solicitud de Express que contiene los datos del usuario (email y password)
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta con una cookie de autenticación y datos del usuario en caso de éxito
   * @throws {400} - Si la validación de datos falla (datos incorrectos o incompletos)
   * @throws {401} - Si las credenciales son inválidas (email o contraseña incorrecta)
   * @throws {500} - Si ocurre un error interno en el servidor durante el proceso
   */
  static async login(req, res) {
    try {
      // Valida los datos para el inicio de sesion
      const validaciones = validationErrors(
        validationPartialUser({ input: req.body })
      );

      if (validaciones !== true) {
        FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erroneos",
          message: "Los datos estan errados",
          error: validaciones,
        });
      }

      //Manda los datos al modelo y espera una respuesta
      const respuestaModel = await loginUser({
        email: asegurarStringEnMinusculas(req.body.email),
      });

      //Se instancia los datos del usuario que devolvio el modelo
      const user = respuestaModel.data;

      //Valida la contraseña para saber si es la que esta en la base de datos
      const validatePassword = await comparePassword(
        req.body.password,
        user.password
      );

      //Verifica que la contraseña si esten bien
      if (!validatePassword) {
        //En su defecto regresa una respuesta de Email o Contraseña invalida"
        FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Credenciales Invalidas",
          message: "Correo o contraseña invalida.",
          error: null,
        });
      }

      // Creando el token de sesion
      const token = createSession({
        object: {
          id: user.id,
          apellidos: user.apellidos,
          nombres: user.nombres,
          roles: user.roles,
          password: user.password,
        },
      });

      //Respondiendo con una cookie y algunos datos que pueden ser de interes
      //WARNING: NO utiizar FormatResponseController
      res
        .cookie("autorization", token, {
          maxAge: 1000 * 60 * 60 * 24, // 1 día
          httpOnly: true,
          secure: true, // obligatorio en producción (HTTPS)
          sameSite: "none", // necesario para cross-site cookies
        })
        .status(200)
        .json({
          status: "success",
          message: "Inicio de sesión exitoso",
          data: {
            id: user.id,
            apellidos: user.apellidos,
            nombres: user.nombres,
            primera_vez: user.primera_vez,
          },
        });
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  /**
   * @static
   * @async
   * @method verificarUsers
   * @description Verifica si el usuario tiene una sesión activa válida y devuelve sus datos
   * @param {Object} req - Objeto de solicitud de Express que contiene los datos del usuario en req.user
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta con los datos del usuario si la sesión es válida
   */
  static async verificarUsers(req, res) {
    const { user } = req;
    return res.status(200).json(user);
  }

  /**
   * @static
   * @async
   * @method closeSession
   * @description Cierra la sesión del usuario eliminando la cookie de autorización
   * @param {Object} req - Objeto de solicitud de Express
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Object} Respuesta indicando el éxito del cierre de sesión
   */
  static async closeSession(req, res) {
    try {
      // Opción 1: Usando clearCookie() (recomendado)
      res.clearCookie("autorization", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/", // Asegurar que se elimine del path correcto
      });

      return res.status(200).json({
        status: "success",
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      console.error("Error en closeSession:", error);
      return res.status(500).json({
        status: "error",
        message: "Error interno al cerrar sesión",
      });
    }
  }

  /**
   * @static
   * @async
   * @method cambiarContraseña
   * @description Maneja el proceso de cambio de contraseña de un usuario.
   * Valida la contraseña actual y actualiza a la nueva contraseña.
   * @param {Object} req - Objeto de solicitud de Express que contiene los datos del usuario (contraseña actual y nueva)
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Respuesta indicando el éxito del cambio de contraseña
   * @throws {400} - Si la validación de datos falla (datos incorrectos o incompletos)
   * @throws {401} - Si la contraseña actual es incorrecta
   * @throws {500} - Si ocurre un error interno en el servidor durante el proceso
   */
  static async cambiarContraseña(req, res) {
    try {
      // 1. Validar los datos de entrada
      const validaciones = validationErrors(
        validationContraseña({ input: req.body })
      );

      if (validaciones !== true) {
        return FormatResponseController.respuestaError(res, {
          status: 400, // Cambié a 400 (Bad Request) para errores de validación
          title: "Datos Inválidos",
          message: "Los datos proporcionados son incorrectos",
          error: validaciones,
        });
      }

      // 2. Validar que la contraseña actual sea correcta
      const validatePassword = await comparePassword(
        req.body.antiguaPassword, // Asumo que se llama contraseñaActual
        req.user.password // Asumo que el campo se llama contrasena
      );

      console.log(validatePassword, req.body.password, req.user.password);
      if (!validatePassword) {
        return FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Contraseña Incorrecta",
          message: "La contraseña actual es incorrecta",
          error: null,
        });
      }

      // 3. Cambiar la contraseña en la base de datos
      const respuestaModel = await cambiarContraseña({
        usuario: { ...req.user },
        contraseña: req.body.password, // Asumo que hay un campo nuevaContraseña
      });

      // 4. Respuesta de éxito
      return FormatResponseController.respuestaExito(res, respuestaModel);
    } catch (error) {
      console.error("Error en cambiarContraseña:", error);
      return FormatResponseController.respuestaError(res, {
        status: 500,
        title: "Error Interno",
        message: "Error al cambiar la contraseña",
        error: process.env.NODE_ENV === "development" ? error.message : null,
      });
    }
  }

  static async enviarNotificacion(req, res) {
    try {
      const servicioNotificaciones = new NotificationService();
      const usuario = req.user;

      const {
        soloNoLeidas = "true",
        limite = "30",
        fechaDesde = null,
        ultimaConexion = null, // 🔥 RECIBIR DEL FRONTEND
      } = req.query;

      // 🔥 ESTRATEGIA DE FECHA:
      // 1. Usar fechaDesde si se proporciona
      // 2. Usar ultimaConexion del frontend
      // 3. Usar último día como fallback
      let fechaFiltro = fechaDesde;

      if (!fechaFiltro && ultimaConexion) {
        fechaFiltro = ultimaConexion;
      }

      if (!fechaFiltro) {
        // Fallback: últimas 24 horas
        fechaFiltro = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      }

      const notificaciones = await servicioNotificaciones.searchNotifications({
        roles: usuario.roles,
        user_id: usuario.id,
        options: {
          soloNoLeidas: soloNoLeidas === "true",
          limite: parseInt(limite),
          fechaDesde: fechaFiltro,
        },
      });

      //console.log(`✅ Notificaciones desde ${fechaFiltro}: ${notificaciones.length}`);
      return res.json(notificaciones);
    } catch (error) {
      //console.error("❌ Error en enviarNotificacion:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
