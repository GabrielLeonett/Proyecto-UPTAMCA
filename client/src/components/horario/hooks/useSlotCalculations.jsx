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
          console.warn("Formato de hora inválido", disponibilidad);
          return slotsDisponibles;
        }

        const diaDisponibilidad = UTILS.obtenerDiaId(disponibilidad.dia_semana);
        if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
          console.warn("Día de semana inválido", disponibilidad.dia_semana);
          return slotsDisponibles;
        }

        const horaHHMMInicio = UTILS.calcularHorasHHMM(
          UTILS.horasMinutos(horaInicio, minutoInicio)
        );
        const horaHHMMFin = UTILS.calcularHorasHHMM(
          UTILS.horasMinutos(horaFin, minutoFin)
        );

        if (horaHHMMInicio >= horaHHMMFin) {
          console.warn(
            "Hora de inicio mayor o igual que hora fin",
            disponibilidad
          );
          return slotsDisponibles;
        }

        // Filtrar horas dentro del rango disponible
        const horasFiltradas = Object.keys(UTILS.initialHours)
          .map(Number)
          .filter(
            (horaHHMM) => horaHHMM >= horaHHMMInicio && horaHHMM <= horaHHMMFin
          )
          .sort((a, b) => a - b);

        if (horasFiltradas.length < bloquesNecesarios) {
          return slotsDisponibles; // No hay suficientes horas disponibles
        }

        // Buscar bloques consecutivos
        for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
          const esConsecutivo = () => {
            for (let j = 0; j < bloquesNecesarios - 1; j++) {
              const indexActual = i + j;
              const indexSiguiente = i + j + 1;

              if (indexSiguiente >= horasFiltradas.length) return false;
              if (horasFiltradas[indexSiguiente] <= horasFiltradas[indexActual])
                return false;
            }
            return true;
          };

          if (!esConsecutivo()) continue;

          // Verificar disponibilidad en horario
          const horasBloque = horasFiltradas.slice(i, i + bloquesNecesarios);
          const esDisponible = horasBloque.every(
            (hora) => tableHorario[diaDisponibilidad]?.horas?.[hora] === null
          );

          if (!esDisponible) continue;

          // Verificar disponibilidad del profesor
          const profesorDisponible = verificarDisponibilidadProfesor(
            clase.idProfesor,
            diaDisponibilidad,
            horasFiltradas[i],
            bloquesNecesarios
          );

          if (profesorDisponible) {
            slotsDisponibles.push({
              diaIndex: diaDisponibilidad,
              horaInicio: horasFiltradas[i],
              bloquesNecesarios,
            });
          }
        }
      } catch (error) {
        console.error(
          "Error procesando disponibilidad:",
          error,
          disponibilidad
        );
      }

      return slotsDisponibles;
    },
    []
  );

  const validarDatosClase = useCallback((clase) => {
    if (!clase || !clase.idProfesor || !clase.horasClase) {
      console.warn("Datos de clase incompletos");
      return false;
    }

    const bloquesNecesarios = parseInt(clase.horasClase);
    if (isNaN(bloquesNecesarios) || bloquesNecesarios <= 0) {
      console.warn("Duración de clase inválida");
      return false;
    }

    return bloquesNecesarios;
  }, []);

  return {
    procesarDisponibilidadDocente,
    validarDatosClase,
  };
};
