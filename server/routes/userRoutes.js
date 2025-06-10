import { Router } from "express";
import UserController from '../controllers/UserController.js'

const { login } = UserController;

export const UserRouter = Router();

//Rutas de autenticacion

UserRouter.post('/login', login)