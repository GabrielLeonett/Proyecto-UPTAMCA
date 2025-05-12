import { ValidationUser } from "../schemas/UserSchema.js";
import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../utils/encrypted.js";
import { createSession } from "../utils/auth.js";
import {asegurarStringEnMinusculas} from "../utils/utilis.js"

const { registerUser, loginUser } = userModel;

export default class UserController {
  //Metodo para registrar un usuario.
  static async register(req, res) {
    try {
      const {
        id,
        nombres,
        email,
        password,
        direccion,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
      } = req.body;

      // Validate the input data
      const validationResult = ValidationUser({ input: req.body });
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      const passwordHasheada = await hashPassword(password);

      const resultModel = await registerUser({
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

      return res.status(201).json(resultModel);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error:", error });
    }
  }
  //Metodo para el loggeo de usuarios
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log("logeando...")

      const resultModel = await loginUser({
        email: asegurarStringEnMinusculas(email),
        password,
      });
      
      const isMatch = await comparePassword(
        password,
        resultModel.user.password
      );

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const user = {
        email: resultModel.user.email,
        id: resultModel.user.id
      }

      // Creando el token de sesion
      const token = createSession({object:user});

      res.cookie("autorization", token, {
        maxAge: 60*60*60*24,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: 'localhost'
      } );
      return res.status(200).json({menssage:"Login successful"});
    } catch (error) {
      return res.status(500).json({ error: "Internal server error:", error });
    }
  }
}
