import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";

export const useAulaAvailability = () => {
  const verificarDisponibilidadAula = useCallback(
    (aulaId, diaIndex, horaInicio, bloquesNecesarios, aulasHorarios) => {
      const horarioAula = aulasHorarios.find(
        (aula) => aula.idAula === aulaId || aula.id_aula === aulaId
      );

      if (!horarioAula || !horarioAula.dias) return true;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
      );

      // Verificar si el aula ya tiene clase en este día y rango de horas
      return !horarioAula.dias.some((dias) => {
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
    verificarDisponibilidadAula,
  };
};