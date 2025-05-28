import { Router } from "express";
import ProfesorController from "../controllers/ProfesorController.js";

const {registrarProfesor, mostrarProfesor, buscarProfesor} = ProfesorController;

export const profesorRouter = Router();

//GET's
profesorRouter.get("/Profesor", mostrarProfesor)

//POST's
profesorRouter.post('/Profesor', registrarProfesor)
profesorRouter.post('/Profesor/search', buscarProfesor)

// //PUT's
// profesorRouter.put('/Profesor?id', actualizarProfesor)


