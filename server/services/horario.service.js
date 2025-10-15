import HorarioModel from "../models/horario.model.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class HorarioService
 * @description Contiene la lógica de negocio relacionada con los horarios académicos
 */
export default class HorarioService {
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

  static async mostrarHorariosProfesores(idProfesor) {
    const rows = await HorarioModel.obtenerHorariosProfesores(idProfesor);
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

  static async mostrarProfesoresParaHorario(horasNecesarias) {
    const rows = await HorarioModel.obtenerProfesoresParaHorario(
      horasNecesarias
    );
    return FormatResponseModel.respuestaPostgres(
      rows,
      "Profesores obtenidos exitosamente"
    );
  }

  static async mostrarAulasParaHorario(nombrePNF) {
    const rows = await HorarioModel.obtenerAulasParaHorario(nombrePNF);
    return FormatResponseModel.respuestaPostgres(
      rows,
      "Aulas obtenidas exitosamente"
    );
  }

  static async registrarHorario(datos, usuario_accion) {
    const resultado = await HorarioModel.insertarHorario(datos, usuario_accion);
    return FormatResponseModel.respuestaPostgres(
      resultado,
      "Horario registrado exitosamente"
    );
  }

  static async generarDocumentoHorario(idSeccion) {
    try {
      console.log("📥 Generando documento para la sección:", idSeccion);

      // 1️⃣ Obtener datos desde el modelo (vista)
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

      // 4️⃣ Llamar a DocumentServices
      const buffer = await DocumentServices.generarDocumentoHorario(
        configuracion
      );

      // 5️⃣ Devolver el buffer
      return buffer;
    } catch (error) {
      console.error("❌ Error en HorarioService:", error);
      throw error;
    }
  }
}
