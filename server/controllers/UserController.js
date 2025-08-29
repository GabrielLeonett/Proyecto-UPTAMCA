import { validationPartialUser } from "../schemas/UserSchema.js";
import UserModel from "../models/UserModel.js";
import { comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";

/**
 * @class UserController
 * @description Esta clase se encarga de gestionar las operaciones relacionadas con los usuarios,
 * incluyendo el inicio de sesión y la verificación de la sesión actual.
 */

const { loginUser } = UserModel;

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
        },
      });

      //Respondiendo con una cookie y algunos datos que pueden ser de interes
      //WARNING: NO utiizar FormatResponseController
      res.cookie("autorization", token, {
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
}
