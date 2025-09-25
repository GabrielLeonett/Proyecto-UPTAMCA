import { Router } from "express";
import NoticationController from '../controllers/notification.controller.js'

const { mostrarNotificacion } = NoticationController;

export const NotificationRoutes = Router();

NotificationRoutes.get('/Notifications', mostrarNotificacion);
