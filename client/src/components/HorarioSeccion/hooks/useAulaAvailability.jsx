import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";
import useHorarioState from "./useHorarioState";

export const useAulaAvailability = () => {
  const { horariosEliminados } = useHorarioState();

  const verificarDisponibilidadAula = useCallback(
    (
      id_aula,
      dia_index,
      horaInicio,
      horaFin,
      aulas_horarios,
      claseActual = null,
    ) => {
      const esClaseNueva = claseActual && !claseActual.id;

      if (!aulas_horarios || !aulas_horarios.horario) {
        return true;
      }

      if (aulas_horarios.aula?.id_aula && aulas_horarios.aula.id_aula !== id_aula) {
        return false;
      }

      if (aulas_horarios.horario.length === 0) {
        return true;
      }

      const horarioAula = aulas_horarios.horario.find(
        (aula) => aula.idAula === id_aula || aula.id_aula === id_aula
      );

      if (!horarioAula || !horarioAula.dias) {
        return true;
      }

      const tieneConflicto = horarioAula.dias.some((dia) => {
        const diaId = UTILS.obtenerDiaId(dia.nombre);
        if (diaId !== dia_index) return false;

        return dia.clases.some((clase) => {
          if (
            claseActual &&
            !esClaseNueva &&
            clase.id === claseActual.id
          ) {
            return false;
          }

          if (horariosEliminados?.includes(clase.id)) {
            return false;
          }

          const claseInicioMinutos = UTILS.deshacerHora24(clase.hora_inicio);
          const claseFinMinutos = UTILS.deshacerHora24(clase.hora_fin);

          const hayConflicto =
            horaInicio < claseFinMinutos &&
            horaFin > claseInicioMinutos;

          return hayConflicto;
        });
      });

      return !tieneConflicto;
    },
    [horariosEliminados],
  );

  return {
    verificarDisponibilidadAula,
  };
};
