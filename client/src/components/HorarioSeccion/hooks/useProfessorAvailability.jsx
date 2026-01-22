import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";
import useHorarioState from "./useHorarioState"; // Si necesitas acceder al estado

// En useProfessorAvailability.js
export const useProfessorAvailability = () => {
  const { horariosEliminados } = useHorarioState();
  const verificarDisponibilidadProfesor = useCallback(
    (
      profesor_id,
      dia_index,
      horaInicio,
      horaFin,
      profesorHorario,
      claseActual = null,
    ) => {
      const esClaseNueva = claseActual && !claseActual.id;

      if (!profesorHorario || !profesorHorario.horario) {
        return true;
      }

      if (profesorHorario.profesor.id_profesor !== profesor_id) {
        return false;
      }

      if (profesorHorario.horario.length === 0) {
        return true;
      }

      const diasProfesor = profesorHorario.horario;

      const tieneConflicto = diasProfesor.some((dia) => {
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
            horaInicio < claseFinMinutos && horaFin > claseInicioMinutos;

          return hayConflicto;
        });
      });

      return !tieneConflicto;
    },
    [horariosEliminados],
  );

  return {
    verificarDisponibilidadProfesor,
  };
};
