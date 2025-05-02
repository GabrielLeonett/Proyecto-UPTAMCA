import { ValidationUser } from "../schemas/UserSchema.js";
import userModel from "../models/userModel.js";
import {hashPassword,comparePassword} from "../utils/encrypted.js"

const {registerUser} = userModel

export default class AuthController {
    
    static async register(req, res) {
        try {
            const {id , nombres, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero } = req.body;

            // Validate the input data
            const validationResult = ValidationUser({ input: req.body });
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.error.errors });
            }

            const passwordHasheada = await hashPassword(password);

            const resultModel = await registerUser({id , nombres, email, password:passwordHasheada, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero })
            
            return res.status(201).json(resultModel);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error:" , error });
        }
    }

}