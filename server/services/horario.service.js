import HorarioModel from "../models/horario.model.js";
import validationService from "./validation.service.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import DocumentServices from "./document.service.js";

/**
 * @class HorarioService
 * @description Contiene la lógica de negocio relacionada con los horarios académicos
 */
export default class HorarioService {
  /**
   * Mostrar los horarios de un profesor en específico
   * @param {number} idProfesor
   * @returns {Object} Respuesta formateada con los horarios del profesor
   */
  static async mostrarHorariosProfesores(idProfesor) {
    try {
      const validation = validationService.validateId(idProfesor, "profesor");
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "ID de profesor inválido"
        );
      }

      const dbResponse = await HorarioModel.obtenerPorProfesor(idProfesor);

      // Si el modelo retorna una respuesta formateada, la adaptamos
      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const rows = dbResponse.data || dbResponse;
      const horariosOrganizados = [];

      rows.forEach((clase) => {
        const nuevaClase = {
          id: clase.id_horario,
          idProfesor: clase.id_profesor,
          idAula: clase.id_aula,
          idUnidadCurricular: clase.id_unidad_curricular,
          horaInicio: clase.hora_inicio,
          horaFin: clase.hora_fin,
          nombreProfesor: clase.nombres_profesor,
          apellidoProfesor: clase.apellidos_profesor,
          nombreUnidadCurricular: clase.nombre_unidad_curricular,
        };

        let horario = horariosOrganizados.find(
          (h) => h.idProfesor === clase.id_profesor
        );
        if (!horario) {
          horario = { idProfesor: clase.id_profesor, dias: [] };
          horariosOrganizados.push(horario);
        }

        let dia = horario.dias.find((d) => d.nombre === clase.dia_semana);
        if (!dia) {
          dia = { nombre: clase.dia_semana, clases: [] };
          horario.dias.push(dia);
        }
        dia.clases.push(nuevaClase);
      });

      return FormatterResponseService.success(
        horariosOrganizados,
        "Horarios del profesor obtenidos exitosamente"
      );
    } catch (error) {
      // Si ya es un error formateado, lo propagamos
      if (error.success === false) {
        throw error;
      }
      // Si es un error crudo, lo formateamos
      return FormatterResponseService.error(
        "Error al obtener horarios del profesor",
        error.message,
        500,
        "HORARIO_PROFESOR_ERROR"
      );
    }
  }

  /**
   * Mostrar los horarios de una sección en específico
   * @param {number} idSeccion
   * @returns {Object} Respuesta formateada con los horarios de la sección
   */
  static async mostrarHorariosPorSeccion(idSeccion) {
    try {
      const validation = validationService.validateId(idSeccion, "sección");
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "ID de sección inválido"
        );
      }

      const dbResponse = await HorarioModel.obtenerPorSeccion(idSeccion);

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      console.log("📊 Respuesta de la base de datos:", dbResponse);

      const rows = dbResponse.data || dbResponse;

      // Validar que hay datos
      if (!rows || rows.length === 0) {
        return FormatterResponseService.notFound("Sección", idSeccion);
      }

      // Usar los nombres correctos de las columnas según tu consulta SQL
      const {
        nombre_pnf, // ← existe en tu SQL
        valor_trayecto, // ← existe en tu SQL
        valor_seccion, // ← existe en tu SQL
        nombre_turno, // ← CORREGIDO: era turno_nombre
        turno_hora_inicio, // ← existe en tu SQL
        turno_hora_fin, // ← existe en tu SQL
      } = rows[0];

      // Procesar los días y clases - usando los nombres correctos de columnas
      const diasUnicos = [...new Set(rows.map((d) => d.dia_semana))]; // ← CORREGIDO: era dia

      const Horario = diasUnicos.map((dia) => ({
        nombre: dia,
        clases: rows
          .filter((d) => d.dia_semana === dia) // ← CORREGIDO: era dia
          .map((cl) => ({
            nombre_unidad_curricular: cl.nombre_unidad_curricular, // ← CORREGIDO: era unidad_curricular
            profesor: `${cl.nombres_profesor} ${cl.apellidos_profesor}`, // ← CORREGIDO: combinar nombre y apellido
            aula: cl.codigo_aula, // ← CORREGIDO: era aula
            horaInicio: cl.hora_inicio,
            horaFin: cl.hora_fin,
          })),
      }));

      // Crear configuración con nombres consistentes
      const configuracion = {
        PNF: nombre_pnf,
        Trayecto: valor_trayecto,
        Seccion: valor_seccion,
        Turno: {
          nombre: nombre_turno, // ← CORREGIDO: era turno_nombre
          horaInicio: turno_hora_inicio || "07:00",
          horaFin: turno_hora_fin || "20:00",
        },
        Horario,
      };

      console.log("✅ Configuración formateada:", configuracion.Horario);

      return FormatterResponseService.success(
        configuracion,
        "Horarios de la sección obtenidos exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al obtener horarios de la sección",
        error.message,
        500,
        "HORARIO_SECCION_ERROR"
      );
    }
  }

  /**
   * Mostrar los horarios de un aula en específico
   * @param {number} idAula
   * @returns {Object} Respuesta formateada con los horarios del aula
   */
  static async mostrarHorariosPorAula(idAula) {
    try {
      const validation = validationService.validateId(idAula, "aula");
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "ID de aula inválido"
        );
      }

      const dbResponse = await HorarioModel.obtenerPorAula(idAula);

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const rows = dbResponse.data || dbResponse;
      const horariosOrganizados = [];

      rows.forEach((clase) => {
        const nuevaClase = {
          id: clase.id_horario,
          idProfesor: clase.id_profesor,
          idAula: clase.id_aula,
          idUnidadCurricular: clase.id_unidad_curricular,
          horaInicio: clase.hora_inicio,
          horaFin: clase.hora_fin,
          nombreProfesor: clase.nombres_profesor,
          apellidoProfesor: clase.apellidos_profesor,
          nombreUnidadCurricular: clase.nombre_unidad_curricular,
        };

        let horario = horariosOrganizados.find(
          (h) => h.idProfesor === clase.id_profesor
        );
        if (!horario) {
          horario = { idProfesor: clase.id_profesor, dias: [] };
          horariosOrganizados.push(horario);
        }

        let dia = horario.dias.find((d) => d.nombre === clase.dia_semana);
        if (!dia) {
          dia = { nombre: clase.dia_semana, clases: [] };
          horario.dias.push(dia);
        }
        dia.clases.push(nuevaClase);
      });

      return FormatterResponseService.success(
        horariosOrganizados,
        "Horarios del aula obtenidos exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al obtener horarios del aula",
        error.message,
        500,
        "HORARIO_AULA_ERROR"
      );
    }
  }

  /**
   * Mostrar profesores disponibles según horas necesarias
   * @param {number} horasNecesarias
   * @returns {Object} Respuesta formateada con profesores disponibles
   */
  static async mostrarProfesoresParaHorario(horasNecesarias) {
    try {
      const validation = validationService.validateId(
        horasNecesarias,
        "horas necesarias"
      );
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "Horas necesarias inválidas"
        );
      }

      const dbResponse = await HorarioModel.obtenerProfesoresDisponibles(
        horasNecesarias
      );

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const rows = dbResponse.data || dbResponse;

      return FormatterResponseService.success(
        rows,
        "Profesores disponibles obtenidos exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al obtener profesores disponibles",
        error.message,
        500,
        "PROFESORES_DISPONIBLES_ERROR"
      );
    }
  }

  /**
   * Mostrar aulas disponibles para un PNF
   * @param {string} nombrePNF
   * @returns {Object} Respuesta formateada con aulas disponibles
   */
  static async mostrarAulasParaHorario(nombrePNF) {
    try {
      const validation = validationService.validarTexto(
        nombrePNF,
        "Nombre del PNF"
      );
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "Nombre de PNF inválido"
        );
      }

      const dbResponse = await HorarioModel.obtenerAulasDisponibles(nombrePNF);

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const rows = dbResponse.data || dbResponse;

      return FormatterResponseService.success(
        rows,
        "Aulas disponibles obtenidas exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al obtener aulas disponibles",
        error.message,
        500,
        "AULAS_DISPONIBLES_ERROR"
      );
    }
  }

  /**
   * Registrar un nuevo horario
   * @param {object} datos
   * @param {object} usuario_accion
   * @returns {Object} Respuesta formateada del registro
   */
  static async registrarHorario(datos, usuario_accion) {
    try {
      const userValidation = validationService.validateId(
        usuario_accion.id,
        "usuario"
      );
      if (!userValidation.isValid) {
        return FormatterResponseService.validationError(
          userValidation.errors,
          "ID de usuario inválido"
        );
      }

      const horarioValidation = validationService.validateHorario(datos);
      if (!horarioValidation.isValid) {
        return FormatterResponseService.validationError(
          horarioValidation.errors,
          "Error de validación en datos del horario"
        );
      }

      const dbResponse = await HorarioModel.crear(datos, usuario_accion.id);

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const resultado = dbResponse.data || dbResponse;

      return FormatterResponseService.created(
        resultado,
        "Horario registrado exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al registrar horario",
        error.message,
        500,
        "REGISTRO_HORARIO_ERROR"
      );
    }
  }

  /**
   * Generar documento PDF del horario de una sección
   * @param {number} idSeccion
   * @returns {Object} Respuesta formateada con el buffer del PDF
   */
  static async generarDocumentoHorario(idSeccion) {
    try {
      const validation = validationService.validateId(idSeccion, "sección");
      if (!validation.isValid) {
        return FormatterResponseService.validationError(
          validation.errors,
          "ID de sección inválido"
        );
      }

      console.log("📥 Generando documento para la sección:", idSeccion);

      // 1️⃣ Obtener datos desde el modelo
      const response = await this.mostrarHorariosPorSeccion(idSeccion);

      if (FormatterResponseService.isError(response)) {
        return response;
      }

      const { data } = response;

      // 4️ Generar documento
      const buffer = await DocumentServices.generarDocumentoHorario(data);

      return FormatterResponseService.success(
        {
          buffer,
          fileName: `Horario${data.PNF}-${data.Trayecto}-${data.Seccion}.docx`,
        },
        "Documento de horario generado exitosamente"
      );
    } catch (error) {
      console.error("❌ Error en HorarioService:", error);

      if (error.success === false) {
        throw error;
      }

      return FormatterResponseService.error(
        "Error al generar documento del horario",
        error.message,
        500,
        "GENERAR_DOCUMENTO_ERROR"
      );
    }
  }
}
