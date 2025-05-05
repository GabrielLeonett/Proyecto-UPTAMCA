import { Router } from "express";
import userController from "../controllers/userController.js";

const { login, register, logout } = userController;

export const userRouter = Router();

//Rutas de autenticacion
userRouter.post("/register", register)
userRouter.post("/login", login)
