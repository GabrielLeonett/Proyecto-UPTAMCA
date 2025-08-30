// Importación de la conexión a la base de datos
import db from "../db.js";

// Importación de clase para formateo de respuestas
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class HorarioModel
 * @description Modelo para gestionar las operaciones relacionadas con horarios académicos
 * @method registrarHorario - Registra un nuevo horario en la base de datos
 */
export default class HorarioModel {
  /**
   * @static
   * @async
   * @method registrarHorario
   * @description Registra un nuevo horario académico llamando a un procedimiento almacenado
   * @param {Object} params - Objeto con parámetros de registro
   * @param {Object} params.datos - Datos del horario a registrar
   * @param {number} params.datos.idSeccion - ID de la sección académica
   * @param {number} params.datos.idProfesor - ID del profesor asignado
   * @param {number} params.datos.idUnidadCurricular - ID de la unidad curricular
   * @param {string} params.datos.diaSemana - Día de la semana (Lunes, Martes, etc.)
   * @param {string} params.datos.horaInicio - Hora de inicio del horario (formato HH:MM)
   * @param {number} params.datos.idAula - Aula asignada
   * @param {Object} params.usuario_accion - Información del usuario que realiza la acción
   * @param {number} params.usuario_accion.id - ID del usuario
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   *
   * @example
   * const resultado = await HorarioModel.registrarHorario({
   *   datos: {
   *     idSeccion: 1,
   *     idProfesor: 5,
   *     idUnidadCurricular: 10,
   *     diaSemana: 'Lunes',
   *     horaInicio: '08:00',
   *     idAula: 1
   *   },
   *   usuario_accion: { id: 1 }
   * });
   */
  static async registrarHorario({ datos, usuario_accion }) {
    try {
      // Extracción de parámetros del objeto datos
      const {
        idSeccion,
        idProfesor,
        idUnidadCurricular,
        diaSemana,
        horaInicio,
        idAula,
      } = datos;

      // Consulta SQL que llama al procedimiento almacenado
      const query = `CALL public.registrar_horario_completo(?, ?, ?, ?, ?, ?, ?, TRUE, NULL)`;

      // Parámetros para el procedimiento almacenado
      const param = [
        usuario_accion.id,
        idSeccion,
        idProfesor,
        idUnidadCurricular,
        idAula,
        diaSemana,
        horaInicio,
      ];

      // Ejecución de la consulta
      const { rows } = await db.raw(query, param);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Horario Registrado exitosamente"
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: "HorarioModel.registrarHorario",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar el horario"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarHorarios
   * @description mostrar los horarios academicos
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   */
  static async mostrarHorarios() {
    try {
      // Consulta SQL que llama a la vista horarios_completas
      const query = `SELECT * FROM public.clases_completas`;

      // Ejecución de la consulta
      const { rows } = await db.raw(query);

      // Estructura para organizar los horarios
      const horariosOrganizados = [];

      // Procesar cada fila de la consulta
      rows.forEach((clase) => {
        const nuevaClase = {
          id: clase.id_horario,
          idProfesor: clase.id_profesor,
          horaInicio: clase.hora_inicio,
          horaFin: clase.hora_fin,
          nombreProfesor: clase.nombres_profesor,
          apellidoProfesor: clase.apellidos_profesor,
          codigoAula: clase.codigo_aula,
          nombreUnidadCurricular: clase.nombre_unidad_curricular,
        };

        // Buscar un horario existente con mismo PNF, trayecto y sección
        const horarioExistente = horariosOrganizados.find(
          (horario) =>
            horario.pnf === clase.nombre_pnf &&
            horario.trayecto === clase.valor_trayecto &&
            horario.seccion === clase.valor_seccion
        );

        if (horarioExistente) {
          // Buscar si ya existe el día en este horario
          const nombreDia = clase.dia_semana;
          let diaExistente = horarioExistente.dias.find(
            (d) => d.nombre === nombreDia
          );

          if (!diaExistente) {
            diaExistente = {
              nombre: nombreDia,
              clases: [],
            };
            horarioExistente.dias.push(diaExistente);
          }

          // Agregar la clase al día correspondiente
          diaExistente.clases.push(nuevaClase);
        } else {
          // Crear nuevo horario
          const nuevoHorario = {
            pnf: clase.nombre_pnf,
            trayecto: clase.valor_trayecto,
            seccion: clase.valor_seccion,
            turno: {
              nombreTurno: clase.nombre_turno,
              horaInicio: clase.turno_hora_inicio,
              horaFin: clase.turno_hora_fin,
            },
            dias: [
              {
                nombre: clase.dia_semana,
                clases: [nuevaClase],
              },
            ],
          };
          horariosOrganizados.push(nuevoHorario);
        }
      });

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        horariosOrganizados,
        "Horarios obtenidos exitosamente"
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: "HorarioModel.mostrarHorarios",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los horarios"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarHorariosProfesores
   * @description mostrar los horarios de los profesores
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   */
  static async mostrarHorariosProfesores(idProfesor) {
    try {
      let filas = [];
      console.log(idProfesor);
      if (idProfesor === undefined || idProfesor === null) {
        const { rows } = await db.raw(`SELECT * FROM public.clases_completas`);
        filas = rows;
      } else {
        // Ejecución de la consulta
        const { rows } = await db.raw(
          `SELECT * FROM public.clases_completas WHERE id_profesor = ${idProfesor}`
        );
        filas = rows;
      }

      // Estructura para organizar los horarios
      const horariosOrganizados = [];

      // Procesar cada fila de la consulta
      filas.forEach((clase) => {
        const nuevaClase = {
          id: clase.id_horario,
          idProfesor: clase.id_profesor,
          horaInicio: clase.hora_inicio,
          horaFin: clase.hora_fin,
          nombreProfesor: clase.nombres_profesor,
          apellidoProfesor: clase.apellidos_profesor,
          nombreUnidadCurricular: clase.nombre_unidad_curricular,
        };

        // Buscar un horario existente con mismo PNF, trayecto y sección
        const horarioExistente = horariosOrganizados.find(
          (horario) => horario.idProfesor === clase.idProfesor
        );

        if (horarioExistente) {
          // Buscar si ya existe el día en este horario
          const nombreDia = clase.dia_semana;
          let diaExistente = horarioExistente.dias.find(
            (d) => d.nombre === nombreDia
          );

          if (!diaExistente) {
            diaExistente = {
              nombre: nombreDia,
              clases: [],
            };
            horarioExistente.dias.push(diaExistente);
          }

          // Agregar la clase al día correspondiente
          diaExistente.clases.push(nuevaClase);
        } else {
          // Crear nuevo horario
          const nuevoHorario = {
            idProfesor: clase.id_profesor,
            dias: [
              {
                nombre: clase.dia_semana,
                clases: [nuevaClase],
              },
            ],
          };
          horariosOrganizados.push(nuevoHorario);
        }
      });

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        horariosOrganizados,
        "Horarios obtenidos exitosamente"
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: "HorarioModel.mostrarHorarios",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los horarios"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarProfesoresParaHorario
   * @description mostrar los horarios academicos
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   */
  static async mostrarProfesoresParaHorario(horas_necesarias) {
    try {
      // Consulta SQL que llama a la vista horarios_completos
      const query = `SELECT id_profesor, nombres, apellidos, disponibilidad, horas_disponibles, areas_de_conocimiento FROM public.profesores_informacion_completa WHERE horas_disponibles > (${horas_necesarias} * INTERVAL '45 minutes')`;

      // Ejecución de la consulta
      const { rows } = await db.raw(query);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Horario Registrado exitosamente"
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: "HorarioModel.registrarHorario",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar el horario"
      );
    }
  }

  /**
   * @static
   * @async
   * @method mostrarAulasParaHorario
   * @description mostrar los horarios academicos
   * @returns {Promise<Object>} Objeto con el resultado de la operación formateado
   * @throws {Error} Cuando ocurre un error en el registro
   */
  static async mostrarAulasParaHorario(nombrePNF) {
    try {
      // Consulta SQL que llama a la vista horarios_completos
      const query = `SELECT id_aula, codigo_aula FROM public.sedes_completas WHERE nombre_pnf = '${nombrePNF}'`;

      // Ejecución de la consulta
      const { rows } = await db.raw(query);

      // Formateo de la respuesta
      const resultado = FormatResponseModel.respuestaPostgres(
        rows,
        "Horario Registrado exitosamente"
      );

      return resultado;
    } catch (error) {
      // Manejo y formateo de errores
      error.details = {
        path: "HorarioModel.registrarHorario",
      };
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar el horario"
      );
    }
  }
}
