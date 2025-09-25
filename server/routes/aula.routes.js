import { Router } from "express";
import { middlewareAuth } from "../middlewares/auth.js";
import AulaController from "../controllers/aulas.controller.js";

// Destructuración de los métodos del controlador de Aula
const { registerAula, mostrarAulas } = AulaController;

// Creación del router para las rutas de Aula
export const AulaRouter = Router();

/**
 * =============================================
 * SECCIÓN DE RUTAS GET
 * =============================================
 */

AulaRouter.get(
  "/api/Aula",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
    "Coordinador",
  ]),
  mostrarAulas
);

/**
 * =============================================
 * SECCIÓN DE RUTAS POST
 * =============================================
 */

AulaRouter.post(
  "/Aula/register",
  middlewareAuth([
    "SuperAdmin",
    "Vicerrector",
    "Director General de Gestión Curricular",
  ]),
  registerAula
);

/**
 * =============================================
 * RUTAS FUTURAS (COMENTADAS)
 * =============================================
 */
// AulaRouter.put('/Aula?id', actualizarAula)
