import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import UserController from '../controllers/useriafjfak.js'

const { login, verificarUsers } = UserController;

export const UserRouter = Router();

//Rutas de autenticacion


//El siguiente Endpoint es para inicio de session hay un ejemplo para prueba
// curl -X POST 'http://127.0.0.1:3000/login' \
//   --header 'Content-Type: application/json' \
//   --data-raw '{
//   "email": "gabrielleonett@uptamca.edu.ve",
//   "password": "12345678"
// }'
UserRouter.post('/login', login)

UserRouter.get('/vefiry', middlewareAuth(null), verificarUsers)