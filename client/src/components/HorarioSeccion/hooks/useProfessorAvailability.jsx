import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";
import useHorarioState from "./useHorarioState"; // Si necesitas acceder al estado

// En useProfessorAvailability.js
export const useProfessorAvailability = () => {
  const { state } = useHorarioState();
  const verificarDisponibilidadProfesor = useCallback(
    (
      profesor_id,
      dia_index,
      hora_inicio,
      bloques_necesarios,
      profesorHorario,
      claseActual = null
    ) => {
      // ✅ IMPORTANTE: Si es una clase nueva (sin id_horario), no saltarse a sí misma
      const esClaseNueva =
        claseActual && !claseActual.id_horario && !claseActual.id;

      // 1. Si no hay datos de horario, está disponible
      if (!profesorHorario || !profesorHorario.horario) {
        return true;
      }

      // 2. Si el array está vacío
      if (profesorHorario.horario.length === 0) {
        return true;
      }

      const diasProfesor = profesorHorario.horario;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(hora_inicio, bloques_necesarios)
      );

      // Verificar si hay conflicto
      const tieneConflicto = diasProfesor.some((dia) => {
        const diaId = UTILS.obtenerDiaId(dia.nombre);
        if (diaId !== dia_index) return false;

        return dia.clases.some((clase) => {
          // ✅ CORRECCIÓN: Solo saltar si NO es una clase nueva y es la misma
          if (
            claseActual &&
            !esClaseNueva &&
            clase.id === claseActual.id_horario
          ) {
            return false;
          }

          // ✅ Saltar horarios eliminados
          if (state?.horariosEliminados?.includes(clase.id)) {
            return false;
          }

          // Convertir horarios a minutos
          const [claseHoraIni, claseMinIni] = clase.hora_inicio.split(":");
          const [claseHoraFin, claseMinFin] = clase.hora_fin.split(":");

          const claseInicioMinutos =
            parseInt(claseHoraIni) * 60 + parseInt(claseMinIni);
          const claseFinMinutos =
            parseInt(claseHoraFin) * 60 + parseInt(claseMinFin);

          const nuevaInicioMinutos =
            Math.floor(hora_inicio / 100) * 60 + (hora_inicio % 100);
          const nuevaFinMinutos =
            Math.floor(horaFin / 100) * 60 + (horaFin % 100);

          // Verificar solapamiento
          const hayConflicto =
            nuevaInicioMinutos < claseFinMinutos &&
            nuevaFinMinutos > claseInicioMinutos;

          return hayConflicto;
        });
      });

      const disponible = !tieneConflicto;
      return disponible;
    },
    [state.horariosEliminados]
  );

  return {
    verificarDisponibilidadProfesor,
  };
};
