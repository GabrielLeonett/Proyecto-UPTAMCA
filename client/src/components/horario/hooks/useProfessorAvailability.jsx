import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";

export const useProfessorAvailability = () => {
  const verificarDisponibilidadProfesor = useCallback(
    (profesorId, diaIndex, horaInicio, bloquesNecesarios, profesoresHorarios) => {
      const horarioProfesor = profesoresHorarios.find(
        (profesor) => profesor.idProfesor === profesorId
      );

      if (!horarioProfesor || !horarioProfesor.dias) return true;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
      );

      // Verificar si el profesor ya tiene clase en este día y rango de horas
      return !horarioProfesor.dias.some((dias) => {
        if (UTILS.obtenerDiaId(dias.nombre) !== diaIndex) return false;

        return dias.clases.some((clase) => {
          const [claseHoraIni, claseMinIni] = clase.horaInicio.split(":");
          const [claseHoraFin, claseMinFin] = clase.horaFin.split(":");

          const claseInicioMinutos =
            parseInt(claseHoraIni) * 60 + parseInt(claseMinIni);
          const claseFinMinutos =
            parseInt(claseHoraFin) * 60 + parseInt(claseMinFin);

          const nuevaInicioMinutos =
            Math.floor(horaInicio / 100) * 60 + (horaInicio % 100);
          const nuevaFinMinutos =
            Math.floor(horaFin / 100) * 60 + (horaFin % 100);

          // Verificar superposición de horarios
          return (
            nuevaInicioMinutos < claseFinMinutos &&
            nuevaFinMinutos > claseInicioMinutos
          );
        });
      });
    },
    []
  );

  return {
    verificarDisponibilidadProfesor,
  };
};