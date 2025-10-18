import { Router } from "express";

export const adminRouter = Router();

//Rutas de autenticacion
/**
 * @name GET /admin/reports
 * @description Obtener reportes del sistema (solo SuperAdmin)
 * @middleware Requiere rol: SuperAdmin
 */
adminRouter.get(
  "/admin/reports",
  middlewareAuth(["SuperAdmin"]),
  (req, res) => {
    fs.readFile("./report/report.json", (err, data) => {
      try {
        if (err) {
          return res.status(500).json({
            status: 500,
            title: "Error del servidor",
            message: "No se pudo leer el archivo de reportes",
          });
        }
        res.json(JSON.parse(data));
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: 500,
          title: "Error del servidor",
          message: "Error al procesar el reporte",
        });
      }
    });
  }
);
