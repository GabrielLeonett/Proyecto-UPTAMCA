import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";

export const useSlotCalculations = () => {
  const procesarDisponibilidadDocente = useCallback(
    (
      disponibilidad,
      bloquesNecesarios,
      tableHorario,
      verificarDisponibilidadProfesor,
      clase
    ) => {
      const slotsDisponibles = [];
      try {
        // Validar parámetros críticos primero
        if (
          !disponibilidad ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin
        ) {
          return slotsDisponibles;
        }

        if (!clase || !clase.id_profesor || !clase.id_unidad_curricular) {
          return slotsDisponibles;
        }

        if (!verificarDisponibilidadProfesor) {
          return slotsDisponibles;
        }

        const [horaInicio, minutoInicio] = disponibilidad.hora_inicio
          .split(":")
          .map(Number);
        const [horaFin, minutoFin] = disponibilidad.hora_fin
          .split(":")
          .map(Number);

        if (
          isNaN(horaInicio) ||
          isNaN(minutoInicio) ||
          isNaN(horaFin) ||
          isNaN(minutoFin)
        ) {
          return slotsDisponibles;
        }

        const diaDisponibilidad = UTILS.obtenerDiaId(disponibilidad.dia_semana);

        if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
          return slotsDisponibles;
        }

        const unidadCurricularYaAsignadaEnDia = () => {
          const horasDia = tableHorario[diaDisponibilidad]?.horas;
          if (!horasDia) {
            return false;
          }

          for (const horaKey in horasDia) {
            const celda = horasDia[horaKey];
            if (celda && celda.datos_clase) {
              // Si encontramos la misma unidad curricular en el mismo día (y no es la misma clase)
              if (
                celda.datos_clase.id_unidad_curricular ===
                  clase.id_unidad_curricular &&
                celda.datos_clase.id !== clase.id
              ) {
                return true;
              }
            }
          }
          return false;
        };

        // Si la unidad curricular ya está asignada en este día, saltar completamente
        if (unidadCurricularYaAsignadaEnDia()) {
          return slotsDisponibles;
        }

        const horaHHMMInicio = UTILS.calcularHorasHHMM(
          UTILS.horasMinutos(horaInicio, minutoInicio)
        );
        const horaHHMMFin = UTILS.calcularHorasHHMM(
          UTILS.horasMinutos(horaFin, minutoFin)
        );

        if (horaHHMMInicio >= horaHHMMFin) {
          return slotsDisponibles;
        }

        // Filtrar horas dentro del rango disponible
        const horasFiltradas = Object.keys(UTILS.initialHours)
          .map(Number)
          .filter(
            (horaHHMM) => horaHHMM >= horaHHMMInicio && horaHHMM < horaHHMMFin
          )
          .sort((a, b) => a - b);

        if (horasFiltradas.length < bloquesNecesarios) {
          return slotsDisponibles;
        }

        for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
          const esConsecutivo = () => {
            for (let j = 0; j < bloquesNecesarios - 1; j++) {
              const indexActual = i + j;
              const indexSiguiente = i + j + 1;

              if (indexSiguiente >= horasFiltradas.length) {
                return false;
              }

              const horaActual = horasFiltradas[indexActual];
              const horaSiguiente = horasFiltradas[indexSiguiente];

              if (horaSiguiente <= horaActual) {
                return false;
              }
            }
            return true;
          };

          if (!esConsecutivo()) {
            continue;
          }

          // Verificar disponibilidad en horario
          const horasBloque = horasFiltradas.slice(i, i + bloquesNecesarios);

          const esDisponible = horasBloque.every((hora) => {
            const celda = tableHorario[diaDisponibilidad]?.horas?.[hora];
            // Si la celda está vacía, está disponible
            if (celda === null || celda === undefined) {
              return true;
            }

            // Si la celda tiene datos, verificamos diferentes casos
            const datosCelda = celda.datos_clase;

            // CASO 2: Mismo profesor pero DIFERENTE clase - NO disponible
            if (datosCelda.id_profesor === clase.id_profesor) {
              return false;
            }

            // CASO 3: Diferente profesor y diferente aula - disponible
            return true;
          });

          if (!esDisponible) {
            continue;
          }

          const profesorDisponible = verificarDisponibilidadProfesor(
            clase.id_profesor,
            diaDisponibilidad,
            horasFiltradas[i],
            bloquesNecesarios,
            clase
          );

          if (!profesorDisponible) {
            continue;
          }

          const slot = {
            dia_index: diaDisponibilidad,
            hora_inicio: horasFiltradas[i],
            hora_fin: horasFiltradas[i + bloquesNecesarios],
            horas_bloques: horasBloque,
            bloques_necesarios: bloquesNecesarios,
          };

          slotsDisponibles.push(slot);
        }
      } catch (error) {
        console.error("Error en procesarDisponibilidadDocente:", error);
      }

      return slotsDisponibles;
    },
    []
  );

  const validarDatosClase = useCallback((clase) => {
    if (!clase || !clase.id_profesor || !clase.horas_clase) {
      return false;
    }

    const bloquesNecesarios = parseInt(clase.horas_clase);
    if (isNaN(bloquesNecesarios) || bloquesNecesarios <= 0) {
      return false;
    }

    return bloquesNecesarios;
  }, []);

  return {
    procesarDisponibilidadDocente,
    validarDatosClase,
  };
};
