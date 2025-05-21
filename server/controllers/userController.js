import { validationUser, validationPartialUser} from "../schemas/UserSchema.js";
import UserModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import {asegurarStringEnMinusculas} from "../utils/utilis.js"

const { registerUser, loginUser } = UserModel;

export default class UserController {
  //Metodo para registrar un usuario.
  static async registerUser(req) {
    try {
      const {id,nombres,email,password,direccion,telefono_movil,telefono_local,fecha_nacimiento,genero} = req.body;

      // Validate the input data
      const validationResult = validationUser({ input: req.body });
      if (!validationResult.success) {
        return validationResult.error.errors
      }

      const passwordHasheada = await hashPassword(password);

      await registerUser({
        id,
        nombres,
        email: asegurarStringEnMinusculas(email),
        password: passwordHasheada,
        direccion,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
      });

      return true;
    } catch (error) {
      throw error
    }
  }

  //Metodo para el loggeo de usuarios
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate the input data
      const validationResult = validationPartialUser({ input: req.body });  
      if(!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      const user = await loginUser({
        email: asegurarStringEnMinusculas(email),
        password
      });

      // Creando el token de sesion
      const token = createSession({object:user});

      res.cookie("autorization", token, {
        maxAge: 60*60*60*24,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: 'localhost'
      } );
      return res.status(200).json({status: 'success', menssage:"Inicio de session exitoso", user});
    } catch (error) {
      return res.status(500).json({status: 'error', error: "Internal server error:", error });
    }
  }
}
