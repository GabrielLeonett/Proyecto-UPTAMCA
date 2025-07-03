import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import UserController from '../controllers/UserController.js'
import fs from 'node:fs'
import { error } from "node:console";
import { date } from "zod";
import { json } from "node:stream/consumers";

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

UserRouter.get('/report', middlewareAuth('SuperAdmin'), (req,res)=>{
    fs.readFile('./report.json', (err, date)=>{
        res.json(JSON.parse(date));
        console.log(err)
    })
})