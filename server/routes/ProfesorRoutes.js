import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import ProfesorController from "../controllers/ProfesorController.js";

const {registrarProfesor, mostrarProfesorAPI, mostrarProfesor, buscarProfesor} = ProfesorController;

export const profesorRouter = Router();

//GET's

//  Esto es lo que espera el endpoint de mostrarProfesorAPI
// curl -X GET 'http://localhost:3000/api/Profesor' \
//   --url-query 'dedicacion=1' \
//   --url-query 'categoria=Instructor' \
//   --url-query 'ubicacion=2' \
//   --url-query 'genero=masculino'
profesorRouter.get("/api/Profesor", mostrarProfesorAPI)

//  Esto es lo que espera el endpoint de mostrarProfesor
// curl -X GET 'http://localhost:3000/api/Profesor' \
profesorRouter.get("/Profesor", mostrarProfesor)

//POST's
// Este JSON es para el endpoint de registrar es una prueba o como se debe utilizar
// {
//   "nombres": "Gabriel Dayer",
//   "apellidos": "Leonett Armas",
//   "email": "gabrielleonett@uptamca.edu.ve",
//   "id": 31264460,
//   "password": "12345678",
//   "direccion": "Av. Bermudez, Los teques",
//   "telefono_movil": "04142245310",
//   "telefono_local": "02122641697",
//   "genero": "masculino",
//   "fecha_nacimiento": "27-11-2004",
//   "fecha_ingreso": "22-03-2021",
//   "dedicacion": "Convencional",
//   "categoria": "Instructor",
//   "area_de_conocimiento": "Inteligencia Artificial",
//   "pre_grado": "Ingeniería en Sistemas",
//   "pos_grado": "Doctorado en Ciencias de la Computación",
//   "ubicacion": "Núcleo de Tegnología y Ciencias Administrativas"
// }
profesorRouter.post('/Profesor/register', middlewareAuth(null), registrarProfesor)

// Esto es lo que debe resivir el endpoint de buscarProfesor
// {
//   "busqueda": "3124460"
// }
profesorRouter.post('/Profesor/search', buscarProfesor)

// //PUT's
// profesorRouter.put('/Profesor?id', actualizarProfesor)


