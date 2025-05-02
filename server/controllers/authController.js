import { ValidationUser } from "../utils/Validations.js";
import authModel from "../models/authModel.js";

const {registerUser} = authModel

export default class AuthController {
    
    static async register(req, res) {
        try {
            const {id , nombres, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero } = req.body;

            // Validate the input data
            const validationResult = ValidationUser({ input: req.body });
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.error.errors });
            }

            const resultModel = await registerUser({id , nombres, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero })
            
            return res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

}