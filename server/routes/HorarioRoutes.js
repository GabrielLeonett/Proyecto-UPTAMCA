import { Router } from "express";
import HorarioController from '../controllers/HorarioController.js'
import { middlewareAuth } from "../middlewares/auth.js";

const { registrarHorario } = HorarioController;

export const HorarioRouter = Router();

//Rutas de autenticacion

HorarioRouter.post(
    '/Horario/create', 
    middlewareAuth([
        'SuperAdmin',
        'Vicerrector',
        'Director General de Gestión Curricular',
        'Coordinador',
        'Profesor'
    ]), 
    registrarHorario
);