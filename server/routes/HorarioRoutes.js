import { Router } from "express";
import HorarioController from '../controllers/HorarioController.js'

const { registrarHorario } = HorarioController;

export const HorarioRouter = Router();

//Rutas de autenticacion

HorarioRouter.post('/Horario/create', registrarHorario)