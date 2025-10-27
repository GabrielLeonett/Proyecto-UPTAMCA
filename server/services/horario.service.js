import HorarioModel from "../models/horario.model.js";
import validationService from "./validation.service.js";
import FormatterResponseService from "../utils/FormatterResponseService.js";
import DocumentServices from "./document.service.js";
import NotificationService from "./notification.service.js";

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
        id_pnf,
        nombre_pnf,
        codigo_pnf,
        valor_trayecto,
        id_trayecto,
        valor_seccion,
        id_seccion,
        nombre_turno,
        turno_hora_inicio,
        turno_hora_fin,
      } = rows[0];

      // ✅ CORREGIDO: Filtrar solo filas que tengan datos reales de horarios
      const filasConHorarios = rows.filter(
        (row) => row.nombre_unidad_curricular && row.hora_inicio && row.hora_fin
      );

      let Horario = [];

      // ✅ CORREGIDO: Solo procesar si hay horarios reales
      if (filasConHorarios.length > 0) {
        const diasUnicos = [
          ...new Set(filasConHorarios.map((d) => d.dia_semana)),
        ];

        // ✅ CORREGIDO: Sintaxis del map corregida
        Horario = diasUnicos.map((dia) => ({
          nombre: dia,
          clases: filasConHorarios
            .filter((clase) => clase.dia_semana === dia)
            .map((clase) => ({
              id: clase.id_horario,
              idProfesor: clase.id_profesor,
              idAula: clase.id_aula,
              idUnidadCurricular: clase.id_unidad_curricular,
              nombreProfesor: clase.nombres_profesor,
              codigoAula: clase.codigo_aula,
              apellidoProfesor: clase.apellidos_profesor,
              nombreUnidadCurricular: clase.nombre_unidad_curricular,
              horaInicio: clase.hora_inicio,
              horaFin: clase.hora_fin,
              idSeccion: clase.id_seccion,
              valorSeccion: clase.valor_seccion,
              nombrePnf: clase.nombre_pnf,
              diaSemana: clase.dia_semana,
              nuevaClase: !clase.id_horario,
            })),
        }));
      }
      // ✅ Si no hay horarios reales, Horario será un array vacío []

      // Crear configuración con nombres consistentes
      const configuracion = {
        PNF: { nombre_pnf, codigo_pnf, id_pnf },
        Trayecto: { id_trayecto, valor_trayecto },
        Seccion: { valor_seccion, id_seccion },
        Turno: {
          nombre: nombre_turno,
          horaInicio: turno_hora_inicio || "07:00",
          horaFin: turno_hora_fin || "20:00",
        },
        Horario, // ✅ Ahora será [] cuando no haya horarios
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
   * @param {number} idSeccion
   * @param {number} horasNecesarias
   * @returns {Object} Respuesta formateada con profesores disponibles
   */
  static async mostrarProfesoresParaHorario(idSeccion, horasNecesarias) {
    try {
      const validationidSeccion = validationService.validateId(
        idSeccion,
        "Id Seccion"
      );
      if (!validationidSeccion.isValid) {
        return FormatterResponseService.validationError(
          validationidSeccion.errors,
          "Id de la seccion inválido"
        );
      }

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
        idSeccion,
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
   * Mostrar aulas disponibles para una seccion y un profesor
   * @param {number} idSeccion - id de la seccion
   * @returns {Object} Respuesta formateada con aulas disponibles
   */
  static async mostrarAulasParaHorario(idSeccion, horasNecesarias, idProfesor) {
    try {
      const validationidSeccion = validationService.validateId(
        idSeccion,
        "id seccion"
      );
      if (!validationidSeccion.isValid) {
        return FormatterResponseService.validationError(
          validationidSeccion.errors,
          "Id de la seccion inválido"
        );
      }

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

      const validationidProfesor = validationService.validateId(
        idProfesor,
        "id profesor"
      );
      if (!validationidProfesor.isValid) {
        return FormatterResponseService.validationError(
          validationidProfesor.errors,
          "Id del profesor inválido"
        );
      }
      const dbResponse = await HorarioModel.obtenerAulasDisponibles(
        idSeccion,
        horasNecesarias,
        idProfesor
      );

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

      // Enviar notificaciones específicas a los involucrados
      console.log("🔔 Enviando notificaciones de horario...");
      const notificationService = new NotificationService();

      // Notificación individual para el PROFESOR asignado
      await notificationService.crearNotificacionIndividual({
        titulo: "Nueva Asignación de Horario",
        tipo: "horario_asignado",
        user_id: datos.id_profesor, // El profesor que recibe el horario
        contenido: `Se le ha asignado un nuevo horario para la unidad curricular "${
          datos.nombre_unidad_curricular || "N/A"
        }" en el aula ${datos.codigo_aula || "N/A"}`,
        metadatos: {
          horario_id: resultado.id_horario || resultado.id,
          profesor_id: datos.id_profesor,
          unidad_curricular: datos.nombre_unidad_curricular,
          aula: datos.codigo_aula,
          dia_semana: datos.dia_semana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
          usuario_asignador: usuario_accion.id,
          fecha_asignacion: new Date().toISOString(),
          url_action: `/horarios/profesor/${datos.id_profesor}`,
        },
      });

      // Notificación para COORDINADORES y DIRECTORES relacionados
      await notificationService.crearNotificacionMasiva({
        titulo: "Nuevo Horario Registrado",
        tipo: "horario_creado",
        contenido: `Se ha registrado un nuevo horario para el profesor en el aula ${
          datos.codigo_aula || "N/A"
        }`,
        metadatos: {
          horario_id: resultado.id_horario || resultado.id,
          profesor_id: datos.id_profesor,
          profesor_nombre: datos.nombre_profesor || "Profesor",
          unidad_curricular: datos.nombre_unidad_curricular,
          aula: datos.codigo_aula,
          dia_semana: datos.dia_semana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
          usuario_creador: usuario_accion.id,
          fecha_registro: new Date().toISOString(),
          url_action: `/horarios/gestion`,
        },
        roles_ids: [2, 7, 8, 20], // Solo Coordinador, Directores y SuperAdmin
        users_ids: [usuario_accion.id], // Usuario que creó el horario
      });

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
        error.status,
        "REGISTRO_HORARIO_ERROR"
      );
    }
  }

  /**
   * Generar documento PDF del horario de una sección
   * @param {number} idSeccion
   * @param {object} usuario_accion - Usuario que genera el documento
   * @returns {Object} Respuesta formateada con el buffer del PDF
   */
  static async generarDocumentoHorario(idSeccion, usuario_accion) {
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

      // Notificación para el usuario que generó el documento
      console.log("🔔 Enviando notificación de generación de documento...");
      const notificationService = new NotificationService();

      await notificationService.crearNotificacionIndividual({
        titulo: "Documento de Horario Generado",
        tipo: "documento_horario_generado",
        user_id: usuario_accion.id,
        contenido: `Se ha generado exitosamente el documento del horario para la sección ${data.Seccion} del PNF ${data.PNF}`,
        metadatos: {
          seccion_id: idSeccion,
          pnf: data.PNF,
          trayecto: data.Trayecto,
          seccion: data.Seccion,
          fecha_generacion: new Date().toISOString(),
          nombre_archivo: `Horario${data.PNF}-${data.Trayecto}-${data.Seccion}.docx`,
          url_action: `/horarios/seccion/${idSeccion}`,
        },
      });

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

  /**
   * Actualizar un horario existente
   * @param {number} idHorario
   * @param {object} datos
   * @param {object} usuario_accion
   * @returns {Object} Respuesta formateada de la actualización
   */
  static async actualizarHorario(idHorario, datos, usuario_accion) {
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

      const horarioIdValidation = validationService.validateId(
        idHorario,
        "horario"
      );
      if (!horarioIdValidation.isValid) {
        return FormatterResponseService.validationError(
          horarioIdValidation.errors,
          "ID de horario inválido"
        );
      }

      const horarioValidation = validationService.validatePartialHorario(datos);
      if (!horarioValidation.isValid) {
        return FormatterResponseService.validationError(
          horarioValidation.errors,
          "Error de validación en datos del horario"
        );
      }

      const dbResponse = await HorarioModel.actualizar(
        idHorario,
        datos,
        usuario_accion.id
      );

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      const resultado = dbResponse.data || dbResponse;

      // Enviar notificaciones específicas por actualización de horario
      console.log("🔔 Enviando notificaciones de actualización de horario...");
      const notificationService = new NotificationService();

      // Obtener información del horario actualizado para notificar al profesor
      const horarioInfo = await HorarioModel.obtenerPorId(idHorario);
      if (horarioInfo && horarioInfo.data && horarioInfo.data.length > 0) {
        const horario = horarioInfo.data[0];

        // Notificación individual para el PROFESOR afectado
        await notificationService.crearNotificacionIndividual({
          titulo: "Horario Actualizado",
          tipo: "horario_actualizado",
          user_id: horario.id_profesor,
          contenido: `Se han realizado modificaciones en su horario asignado. Verifique los cambios realizados.`,
          metadatos: {
            horario_id: idHorario,
            profesor_id: horario.id_profesor,
            campos_actualizados: Object.keys(datos),
            usuario_actualizador: usuario_accion.id,
            fecha_actualizacion: new Date().toISOString(),
            url_action: `/horarios/profesor/${horario.id_profesor}`,
          },
        });
      }

      // Notificación para coordinadores/directores
      await notificationService.crearNotificacionMasiva({
        titulo: "Horario Actualizado",
        tipo: "horario_modificado",
        contenido: `Se han realizado cambios en el horario ID: ${idHorario}`,
        metadatos: {
          horario_id: idHorario,
          campos_actualizados: Object.keys(datos),
          usuario_actualizador: usuario_accion.id,
          fecha_actualizacion: new Date().toISOString(),
          url_action: `/horarios/gestion`,
        },
        roles_ids: [2, 7, 8, 20], // Solo Coordinador, Directores y SuperAdmin
        users_ids: [usuario_accion.id],
      });

      return FormatterResponseService.success(
        resultado,
        "Horario actualizado exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al actualizar horario",
        error.message,
        error.status,
        "ACTUALIZAR_HORARIO_ERROR"
      );
    }
  }

  /**
   * Eliminar un horario
   * @param {number} idHorario
   * @param {object} usuario_accion
   * @returns {Object} Respuesta formateada de la eliminación
   */
  static async eliminarHorario(idHorario, usuario_accion) {
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

      const horarioValidation = validationService.validateId(
        idHorario,
        "horario"
      );
      if (!horarioValidation.isValid) {
        return FormatterResponseService.validationError(
          horarioValidation.errors,
          "ID de horario inválido"
        );
      }

      // Obtener información del horario antes de eliminarlo para notificar
      const horarioInfo = await HorarioModel.obtenerPorId(idHorario);
      if (!horarioInfo || !horarioInfo.data || horarioInfo.data.length === 0) {
        return FormatterResponseService.notFound("Horario", idHorario);
      }

      const horario = horarioInfo.data[0];

      const dbResponse = await HorarioModel.eliminar(
        idHorario,
        usuario_accion.id
      );

      if (dbResponse && dbResponse.state === "error") {
        return FormatterResponseService.fromDatabaseResponse(dbResponse);
      }

      // Enviar notificaciones específicas por eliminación de horario
      console.log("🔔 Enviando notificaciones de eliminación de horario...");
      const notificationService = new NotificationService();

      // Notificación individual para el PROFESOR afectado
      await notificationService.crearNotificacionIndividual({
        titulo: "Horario Eliminado",
        tipo: "horario_eliminado",
        user_id: horario.id_profesor,
        contenido: `Se ha eliminado su horario asignado para ${horario.nombre_unidad_curricular} en el aula ${horario.codigo_aula}`,
        metadatos: {
          horario_id: idHorario,
          profesor_id: horario.id_profesor,
          unidad_curricular: horario.nombre_unidad_curricular,
          aula: horario.codigo_aula,
          dia_semana: horario.dia_semana,
          usuario_eliminador: usuario_accion.id,
          fecha_eliminacion: new Date().toISOString(),
        },
      });

      // Notificación para coordinadores/directores
      await notificationService.crearNotificacionMasiva({
        titulo: "Horario Eliminado",
        tipo: "horario_eliminado_admin",
        contenido: `Se ha eliminado el horario del profesor ${horario.nombres_profesor} ${horario.apellidos_profesor}`,
        metadatos: {
          horario_id: idHorario,
          profesor_id: horario.id_profesor,
          profesor_nombre: `${horario.nombres_profesor} ${horario.apellidos_profesor}`,
          unidad_curricular: horario.nombre_unidad_curricular,
          aula: horario.codigo_aula,
          usuario_eliminador: usuario_accion.id,
          fecha_eliminacion: new Date().toISOString(),
          url_action: `/horarios/gestion`,
        },
        roles_ids: [2, 7, 8, 20], // Solo Coordinador, Directores y SuperAdmin
        users_ids: [usuario_accion.id],
      });

      return FormatterResponseService.success(
        { horario_id: idHorario },
        "Horario eliminado exitosamente"
      );
    } catch (error) {
      if (error.success === false) {
        throw error;
      }
      return FormatterResponseService.error(
        "Error al eliminar horario",
        error.message,
        error.status,
        "ELIMINAR_HORARIO_ERROR"
      );
    }
  }
}
