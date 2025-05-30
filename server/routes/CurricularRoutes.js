import { Router } from "express";
import CurricularController from '../controllers/CurricularController.js'

const { regitrarPNF } = CurricularController;

export const CurricularRouter = Router();

CurricularRouter.post('/PNF/create', regitrarPNF);