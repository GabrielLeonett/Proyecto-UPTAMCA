import { Router } from "express";
import userController from "../controllers/userController.js";
import { middlewareSession } from "../middlewares/auth.js";

const { login, register} = userController;

export const userRouter = Router();

//Rutas de autenticacion
userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.get("/profesores", middlewareSession, (req, res) => {
    res.json({messsage:'Acceso concebido', user: req.user})
})
