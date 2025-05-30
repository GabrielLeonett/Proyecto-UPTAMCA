import { validationPartialUser } from "../schemas/UserSchema.js";
import UserModel from "../models/UserModel.js";
import { comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import { asegurarStringEnMinusculas } from "../utils/utilis.js";

const { loginUser } = UserModel;

export default class UserController {
  //Metodo para el loggeo de usuarios
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
      const respuestaModel = await loginUser({email: asegurarStringEnMinusculas(req.body.email)});
      //Verifica que la respuesta del modelo sea la correcta
      if(respuestaModel.data.status != 'success'){
        res.status(401).json({status: false, message: respuestaModel.message})
      }

      //Se instancia los datos del usuario que devolvio el modelo
      const user = respuestaModel.data.usuario;    
      
      //Valida la contraseña para saber si es la que esta en la base de datos
      const validatePassword = await comparePassword(req.body.password, user.password);
      //Verifica que la contraseña si esten bien
      if(!validatePassword){
        //En su defecto regresa una respuesta de Email o Contraseña invalida"
        res.status(401).json({status: false, message: "Email o Contraseña invalida"});
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

      //Respondiendo con una cookie 
      res.cookie("autorization", token, {
        maxAge: 60 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        domain: "localhost",
      });

      //Responde con la respuesta de Inicio de session exitoso
      return res.status(200).json({
        status: "success",
        message: "Inicio de session exitoso",
        user: {
          id: user.id,
          apellidos: user.apellidos,
          nombres: user.nombres,
          roles: user.roles,
        }
      });
    } catch (error) {
      //Responde con la respuesta de un error y el mensaje
      res.status(500).json({ status: "error", message: error});
    }
  }
}
