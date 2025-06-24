import { Router } from "express";
import CurricularController from '../controllers/CurricularController.js'

const { regitrarPNF, regitrarUnidadCurricular,mostrarPNF, mostrarTrayectos ,mostrarUnTrayecto} = CurricularController;

export const CurricularRouter = Router();

CurricularRouter.post('/PNF/create', regitrarPNF);

CurricularRouter.post('/Unidad_Curricular/create', regitrarUnidadCurricular);

CurricularRouter.get('/PNF', mostrarPNF);

CurricularRouter.get('/Trayectos', mostrarTrayectos);

CurricularRouter.get('/Trayecto', mostrarUnTrayecto);