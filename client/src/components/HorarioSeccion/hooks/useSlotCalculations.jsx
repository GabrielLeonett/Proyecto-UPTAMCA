import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";

export const useSlotCalculations = () => {
  const procesarDisponibilidadDocente = useCallback(
    (
      disponibilidad,
      bloquesNecesarios,
      tableHorario,
      verificarDisponibilidadProfesor,
      verificarDisponibilidadAula,
      clase,
    ) => {
      const slotsDisponibles = [];
      try {
        // 1. VALIDACIONES BÁSICAS
        if (
          !disponibilidad ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin ||
          !disponibilidad.dia_semana
        ) {
          console.warn("Disponibilidad incompleta", disponibilidad);
          return slotsDisponibles;
        }

        if (
          !clase ||
          !clase.id_profesor ||
          !clase.id_unidad_curricular ||
          !clase.id_aula
        ) {
          console.warn("Clase incompleta", clase);
          return slotsDisponibles;
        }

        // 2. CONVERTIR HORAS
        const horaHHMMInicio = UTILS.deshacerHora24(disponibilidad.hora_inicio);
        const horaHHMMFin = UTILS.deshacerHora24(disponibilidad.hora_fin);

        if (
          horaHHMMInicio === null ||
          horaHHMMFin === null ||
          horaHHMMInicio >= horaHHMMFin
        ) {
          console.warn("Rango de horas inválido", {
            horaHHMMInicio,
            horaHHMMFin,
          });
          return slotsDisponibles;
        }

        const diaDisponibilidad = UTILS.obtenerDiaId(disponibilidad.dia_semana);

        if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
          console.warn("Día inválido", disponibilidad.dia_semana);
          return slotsDisponibles;
        }

        // 3. VERIFICAR SI LA UNIDAD CURRICULAR YA ESTÁ EN ESE DÍA
        const unidadCurricularYaAsignadaEnDia = () => {
          const horasDia = tableHorario[diaDisponibilidad]?.horas;
          if (!horasDia) return false;

          for (const horaKey in horasDia) {
            const celda = horasDia[horaKey];

            if (!celda || typeof celda === "string" || !celda.datos_clase) {
              continue;
            }

            const esMismaUnidad =
              celda.datos_clase.id_unidad_curricular ===
              clase.id_unidad_curricular;
            const esDiferenteRegistro =
              !clase.id || celda.datos_clase.id !== clase.id;

            if (esMismaUnidad && esDiferenteRegistro) {
              return true;
            }
          }
          return false;
        };

        if (unidadCurricularYaAsignadaEnDia()) {
          console.warn("Unidad curricular ya asignada en este día");
          return slotsDisponibles;
        }

        // 4. FILTRAR HORAS DENTRO DEL RANGO REAL
        const horasFiltradas = Object.keys(UTILS.initialHours)
          .map(Number)
          .filter((horaHHMM) => {
            const dentroDelRango =
              horaHHMM >= horaHHMMInicio && horaHHMM < horaHHMMFin;
            return dentroDelRango;
          })
          .sort((a, b) => a - b);

        if (horasFiltradas.length < bloquesNecesarios) {
          console.warn("Horas insuficientes en el rango");
          return slotsDisponibles;
        }

        // 5. FUNCIÓN PARA OBTENER BLOQUES CONSECUTIVOS (SIN SALTOS ILEGALES)
        const obtenerHorasConsecutivas = (indiceInicio) => {
          const horasConsecutivas = [];
          let bloquesEncontrados = 0;
          let indiceActual = indiceInicio;

          while (
            bloquesEncontrados < bloquesNecesarios &&
            indiceActual < horasFiltradas.length
          ) {
            const horaActual = horasFiltradas[indiceActual];
            const celda = tableHorario[diaDisponibilidad]?.horas?.[horaActual];

            // ⛔ Si no existe la celda → inválido
            if (celda === undefined) {
              return [];
            }

            // ✅ Receso (string): se incluye pero no cuenta como bloque
            if (typeof celda === "string") {
              horasConsecutivas.push(horaActual);
            } else {
              // Si está ocupada por otra clase distinta → inválido
              if (celda?.datos_clase && celda.datos_clase.id !== clase.id) {
                return [];
              }

              horasConsecutivas.push(horaActual);
              bloquesEncontrados++;
            }

            indiceActual++;
          }

          return bloquesEncontrados === bloquesNecesarios
            ? horasConsecutivas
            : [];
        };

        // 6. PROBAR TODAS LAS POSICIONES POSIBLES
        for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
          const horasConsecutivas = obtenerHorasConsecutivas(i);
          
          if(typeof UTILS.initialHours[horasConsecutivas[0]] === 'string') continue;

          if (!horasConsecutivas.length) continue;
          
          // 9. CALCULAR HORA FIN REAL
          const horaInicio = horasConsecutivas[0];
          const horaFinCalculada = horasConsecutivas[horasConsecutivas.length - 1];

          // 10. VALIDAR QUE NO SE PASE DEL RANGO DE DISPONIBILIDAD
          if (horaInicio < horaHHMMInicio || horaFinCalculada >= horaHHMMFin) {
            continue;
          }

          // 7. VERIFICAR DISPONIBILIDAD DEL PROFESOR
          const profesorDisponible = verificarDisponibilidadProfesor(
            clase.id_profesor,
            diaDisponibilidad,
            horasConsecutivas[0],
            horaFinCalculada,
            clase.profesorHorario,
            clase,
          );

          if (!profesorDisponible) continue;

          // 8. VERIFICAR DISPONIBILIDAD DEL AULA
          const aulaDisponible = verificarDisponibilidadAula(
            clase.id_aula,
            diaDisponibilidad,
            horasConsecutivas[0],
            horaFinCalculada,
            clase.aulas_horarios,
            clase,
          );

          if (!aulaDisponible) continue;


          // 11. CREAR SLOT
          const slot = {
            dia_index: diaDisponibilidad,
            hora_inicio: horaInicio,
            hora_fin: horaFinCalculada,
            horas_bloques: horasConsecutivas,
            bloques_necesarios: bloquesNecesarios,
          };

          slotsDisponibles.push(slot);
        }
      } catch (error) {
        console.error("Error en procesarDisponibilidadDocente:", error);
      }

      return slotsDisponibles;
    },
    [],
  );

  // ✅ AGREGAR FUNCIÓN DE VALIDACIÓN MEJORADA
  const validarDatosClase = useCallback((clase) => {
    try {
      if (!clase) {
        console.warn("Clase no definida");
        return false;
      }

      if (clase.horas_clase <= 0 || clase.horas_clase > 10) {
        // Límite razonable
        console.warn("Bloques necesarios inválidos:", clase.horas_clase);
        return false;
      }

      return clase.horas_clase;
    } catch (error) {
      console.error("Error en validarDatosClase:", error);
      return false;
    }
  }, []);

  return {
    procesarDisponibilidadDocente,
    validarDatosClase,
  };
};
