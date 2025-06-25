import { validationPartialUser } from "../schemas/UserSchema.js";
import UserModel from "../models/UserModel.js";
import { comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";

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
      const validationResult = validationPartialUser({ input: req.body });
      
      //Verifica que todos los datos ingresado sean correctos
      if (!validationResult.success) {
        //En su defecto regresa una respuesta de los errores en los inputs
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      //Manda los datos al modelo y espera una respuesta
      const respuestaModel = await loginUser({
        email: asegurarStringEnMinusculas(req.body.email),
      });
      
      //Verifica que la respuesta del modelo sea la correcta
      if (respuestaModel.state != "success") {
        res
          .status(401)
          .json({ status: false, message: respuestaModel.message });
      }

      //Se instancia los datos del usuario que devolvio el modelo
      const user = respuestaModel.data.usuario;

      //Valida la contraseña para saber si es la que esta en la base de datos
      const validatePassword = await comparePassword(
        req.body.password,
        user.password
      );
      
      //Verifica que la contraseña si esten bien
      if (!validatePassword) {
        //En su defecto regresa una respuesta de Email o Contraseña invalida"
        res
          .status(401)
          .json({ status: false, message: "Email o Contraseña invalida" });
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
      res.cookie("autorization", token, {
        maxAge: 60 * 60 * 24 * 1000, // Corregido: debe ser en milisegundos (1 día)
        httpOnly: true, // La cookie solo es accesible por el servidor
        secure: false, // En desarrollo puede ser false, en producción debería ser true para HTTPS
        sameSite: "lax", // Política de sameSite para protección CSRF
        domain: "localhost", // Dominio donde es válida la cookie
      }).status(200).json({
        status: "success",
        message: "Inicio de sesión exitoso",
        user: {
          id: user.id,
          apellidos: user.apellidos,
          nombres: user.nombres,
          roles: user.roles,
        }
      });
    } catch (error) {
      //Responde con la respuesta de un error y el mensaje
      res.status(500).json({ status: "error", message: error });
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