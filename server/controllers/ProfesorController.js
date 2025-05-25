import UserController from "./UserController.js";
import {validationProfesor,validationPartialProfesor} from '../schemas/ProfesorSchema.js'
import 

class ProfesorController extends UserController {
    static async registrarProfesor(req, res){
        try {
            this.registerUser(req);
            const validations = validationProfesor({input: req.body})
            if(!validations.success){
                throw validations.error.errors;
            }


        } catch (error) {
            
        }
    }
}