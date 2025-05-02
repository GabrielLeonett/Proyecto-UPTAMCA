import { Router } from "express";
import authController from "../controllers/authController.js";

const { login, register, logout } = authController;

export const authRouter = Router();

//Rutas de autenticacion
authRouter.post("/register", register)
