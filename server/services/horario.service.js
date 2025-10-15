import HorarioModel from "../models/horario.model.js";
import validationService from "./validation.service.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";
import DocumentServices from "./document.service.js";

/**
 * @class HorarioService
 * @description Contiene la lógica de negocio relacionada con los horarios académicos
 */
export default class HorarioService {
  /**
   * Mostrar todos los horarios organizados por PNF, Trayecto y Sección
   */
  static async mostrarHorarios() {
    const rows = await HorarioModel.obtenerHorarios();

    // Procesar y organizar horarios
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

      const horarioExistente = horariosOrganizados.find(
        (h) =>
          h.pnf === clase.nombre_pnf &&
          h.trayecto === clase.valor_trayecto &&
          h.seccion === clase.valor_seccion
      );

      if (horarioExistente) {
        let dia = horarioExistente.dias.find(
          (d) => d.nombre === clase.dia_semana
        );
        if (!dia) {
          dia = { nombre: clase.dia_semana, clases: [] };
          horarioExistente.dias.push(dia);
        }
        dia.clases.push(nuevaClase);
      } else {
        horariosOrganizados.push({
          pnf: clase.nombre_pnf,
          trayecto: clase.valor_trayecto,
          seccion: clase.valor_seccion,
          idSeccion: clase.id_seccion,
          turno: {
            nombreTurno: clase.nombre_turno,
            horaInicio: clase.turno_hora_inicio,
            horaFin: clase.turno_hora_fin,
          },
          dias: [{ nombre: clase.dia_semana, clases: [nuevaClase] }],
        });
      }
    });

    return FormatResponseModel.respuestaPostgres(
      horariosOrganizados,
      "Horarios obtenidos exitosamente"
    );
  }

  /**
   * Mostrar los horarios de un profesor en específico
   * @param {number} idProfesor
   */
  static async mostrarHorariosProfesores(idProfesor) {
    validationService.validarIdNumerico(idProfesor, "ID de profesor");

    const rows = await HorarioModel.obtenerPorProfesor(idProfesor);
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

    return FormatResponseModel.respuestaPostgres(
      horariosOrganizados,
      "Horarios obtenidos exitosamente"
    );
  }

  /**
   * Mostrar profesores disponibles según horas necesarias
   * @param {number} horasNecesarias
   */
  static async mostrarProfesoresParaHorario(horasNecesarias) {
    validationService.validarIdNumerico(horasNecesarias, "Horas necesarias");

    const rows = await HorarioModel.obtenerProfesoresParaHorario(
      horasNecesarias
    );
    return FormatResponseModel.respuestaPostgres(
      rows,
      "Profesores obtenidos exitosamente"
    );
  }

  /**
   * Mostrar aulas disponibles para un PNF
   * @param {string} nombrePNF
   */
  static async mostrarAulasParaHorario(nombrePNF) {
    validationService.validarTexto(nombrePNF, "Nombre del PNF");

    const rows = await HorarioModel.obtenerAulasParaHorario(nombrePNF);
    return FormatResponseModel.respuestaPostgres(
      rows,
      "Aulas obtenidas exitosamente"
    );
  }

  /**
   * Registrar un nuevo horario
   * @param {object} datos
   * @param {object} usuario_accion
   */
  static async registrarHorario(datos, usuario_accion) {
    validationService.validarIdNumerico(
      usuario_accion.id,
      "ID del usuario en sesión"
    );
    validationService.validateHorario(datos);

    const resultado = HorarioModel.crear(datos, usuario_accion);

    return FormatResponseModel.respuestaPostgres(
      resultado,
      "Horario registrado exitosamente"
    );
  }

  /**
   * Generar documento PDF del horario de una sección
   * @param {number} idSeccion
   */
  static async generarDocumentoHorario(idSeccion) {
    try {
      validationService.validarIdNumerico(idSeccion, "ID de la sección");
      console.log("📥 Generando documento para la sección:", idSeccion);

      // 1️⃣ Obtener datos desde el modelo
      const datos = await HorarioModel.obtenerHorarioPorSeccion(idSeccion);
      if (!datos || datos.length === 0) {
        throw new Error("No se encontraron datos para esta sección");
      }

      // 2️⃣ Procesar los datos al formato que espera DocumentServices
      const { pnf, trayecto, seccion, turno } = datos[0];
      const dias = [...new Set(datos.map((d) => d.dia))];

      const Horario = dias.map((dia) => ({
        nombre: dia,
        clases: datos
          .filter((d) => d.dia === dia)
          .map((cl) => ({
            nombre_unidad_curricular: cl.unidad_curricular,
            profesor: cl.profesor,
            aula: cl.aula,
            horaInicio: cl.hora_inicio,
            horaFin: cl.hora_fin,
          })),
      }));

      // 3️⃣ Crear configuración
      const configuracion = {
        PNF: pnf,
        Trayecto: trayecto,
        Seccion: { seccion },
        Turno: {
          horaInicio: turno?.hora_inicio || "07:00",
          horaFin: turno?.hora_fin || "20:00",
        },
        Horario,
      };

      // 4️⃣ Generar documento
      const buffer = await DocumentServices.generarDocumentoHorario(
        configuracion
      );

      return buffer;
    } catch (error) {
      console.error("❌ Error en HorarioService:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al generar el documento del horario"
      );
    }
  }
}
