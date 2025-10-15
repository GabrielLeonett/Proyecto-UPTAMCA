import {
  validationHorario,
  validationPartialHorario,
} from "../schemas/HorarioSchema.js";
import { validationPartialUnidadCurricular } from "../schemas/UnidadCurricularSchema.js";
import { validationPartialPNF } from "../schemas/PnfSchema.js";
import validationErrors from "../utils/validationsErrors.js";
import FormatResponseController from "../utils/FormatResponseController.js";
import HorarioService from "../services/HorarioService.js";

/**
 * @class HorarioController
 * @description Controlador para gestionar las operaciones relacionadas con horarios académicos
 */
export default class HorarioController {
  static async mostrarHorarios(req, res) {
    try {
      const respuesta = await HorarioService.mostrarHorarios();
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  static async mostrarHorariosProfesores(req, res) {
    try {
      const idProfesor = parseInt(req.query.Profesor);
      if (idProfesor != undefined) {
        const validaciones = validationErrors(
          validationPartialHorario({ input: { idProfesor } })
        );
        if (validaciones !== true)
          return FormatResponseController.respuestaError(res, {
            status: 401,
            title: "Datos Erróneos",
            message: "Los datos están errados",
            error: validaciones,
          });
      }

      const respuesta = await HorarioService.mostrarHorariosProfesores(
        idProfesor
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  static async mostrarAulasParaHorario(req, res) {
    try {
      const nombrePNF = req.query.pnf;
      const validaciones = validationErrors(
        validationPartialPNF({ input: { nombrePNF } })
      );
      if (validaciones !== true)
        return FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erróneos",
          message: "Los datos están errados",
          error: validaciones,
        });

      const respuesta = await HorarioService.mostrarAulasParaHorario(nombrePNF);
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  static async mostrarProfesoresParaHorario(req, res) {
    try {
      const horasNecesarias = parseInt(req.query.horasNecesarias);
      const validaciones = validationErrors(
        validationPartialUnidadCurricular({
          input: { cargaHorasAcademicas: horasNecesarias },
        })
      );
      if (validaciones !== true)
        return FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erróneos",
          message: "Los datos están errados",
          error: validaciones,
        });

      const respuesta = await HorarioService.mostrarProfesoresParaHorario(
        horasNecesarias
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }

  static async registrarHorario(req, res) {
    try {
      const validaciones = validationErrors(
        validationHorario({ input: req.body })
      );
      if (validaciones !== true)
        return FormatResponseController.respuestaError(res, {
          status: 401,
          title: "Datos Erróneos",
          message: "Los datos están errados",
          error: validaciones,
        });

      const respuesta = await HorarioService.registrarHorario(
        req.body,
        req.user
      );
      FormatResponseController.respuestaExito(res, respuesta);
    } catch (error) {
      FormatResponseController.respuestaError(res, error);
    }
  }
  static async exportarHorarioWord(req, res) {
    try {
      const { id_seccion } = req.params;
      if (!id_seccion) {
        return res
          .status(400)
          .json({ error: "El parámetro id_seccion es obligatorio" });
      }

      console.log("📄 Solicitando documento Word para la sección:", id_seccion);

      // 1️⃣ Llamar al servicio
      const buffer = await HorarioService.generarDocumentoHorario(id_seccion);

      // 2️⃣ Enviar respuesta como archivo Word
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=horario_${id_seccion}.docx`
      );
      res.send(buffer);
    } catch (error) {
      console.error("❌ Error en exportarHorarioWord:", error);
      res
        .status(500)
        .json({ error: "Error al generar el documento de horario" });
    }
  }
}
