import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import UserController from "../controllers/user.controller.js";
import fs from "node:fs";

const { login, verificarUsers, closeSession, cambiarContraseña } = UserController;

export const UserRouter = Router();

//Rutas de autenticacion

//El siguiente Endpoint es para inicio de session hay un ejemplo para prueba
// curl -X POST 'http://127.0.0.1:3000/login' \
//   --header 'Content-Type: application/json' \
//   --data-raw '{
//   "email": "gabrielleonett@uptamca.edu.ve",
//   "password": "12345678"
// }'
UserRouter.post("/login", login);

UserRouter.get("/vefiry", middlewareAuth(null), verificarUsers);

UserRouter.get("/logout", middlewareAuth(null), closeSession);

UserRouter.put(
  "/cambiar-contrasena",
  middlewareAuth(
    "Profesor",
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador"
  ),
  cambiarContraseña
);

UserRouter.get("/report", middlewareAuth("SuperAdmin"), (req, res) => {
  fs.readFile("./report.json", (err, date) => {
    try {
      res.json(JSON.parse(date));
    } catch (err) {
      console.log(err);
    }
  });
});
