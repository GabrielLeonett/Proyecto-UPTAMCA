import { Router } from "express";
import UserController from "../controllers/UserController";

export const UserRouter = Router();

//Rutas de autenticacion

UserRouter.post('/login', UserController.login)