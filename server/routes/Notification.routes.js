import { Router } from "express";
import NoticationController from '../controllers/notificationController.js'

const { mostrarNotificacion } = NoticationController;

export const NotificationRoutes = Router();

NotificationRoutes.get('/Notifications', mostrarNotificacion);
