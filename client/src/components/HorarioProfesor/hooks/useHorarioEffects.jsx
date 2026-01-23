import { useEffect, useCallback } from "react";
import { UTILS } from "../../../utils/utils";

// Efecto para carga inicial de horario
const useHorarioInitialization = (props, stateSetters) => {
  const { horario, turno } = props;
  const { setTableHorario, setTableHorarioOriginal } = stateSetters;

  const obtenerClases = useCallback(
    (Dias, turno) => {
      const { horaInicioHHMM, horaFinHHMM } = UTILS.obtenerTurno(turno);

      // Filtrar horas dentro del turno
      const horasFiltradas = {};
      Object.keys(UTILS.initialHours).forEach((key) => {
        const horaHHMM = Number(key);
        if (horaHHMM >= horaInicioHHMM && horaHHMM < horaFinHHMM) {
          horasFiltradas[key] = UTILS.initialHours[key];
        }
      });
      const horasKeys = Object.keys(horasFiltradas).map((h) => Number(h));

      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          dia: item.dia,
          horas: { ...horasFiltradas },
        }));

        Dias.forEach((dia) => {
          if (dia.nombre === null) return;
          let idDia = UTILS.obtenerDiaId(dia.nombre.toLowerCase());

          if (idDia === -1) return;

          dia.clases.forEach((clase) => {
            const inicio = UTILS.deshacerHora24(clase.hora_inicio);
            const fin = UTILS.deshacerHora24(clase.hora_fin);
            let recesos = 0;
            horasKeys.filter((horaHHMM) => {
              if (
                horaHHMM > inicio &&
                horaHHMM < fin &&
                typeof UTILS.initialHours[horaHHMM] === "string"
              ) {
                recesos += 1;
              }
            });

            const bloques =
              Object.keys(UTILS.initialHours).map(Number).indexOf(fin) -
              horasKeys.indexOf(inicio) -
              recesos;
            let bloquesCoinciden = 0;
            horasKeys.forEach((horaHHMM) => {
              if (horaHHMM >= inicio && horaHHMM < fin) {
                if (
                  typeof UTILS.initialHours[horaHHMM] !== "string" &&
                  horasFiltradas[horaHHMM] !== undefined
                ) {
                  nuevaMatriz[idDia].horas[horaHHMM] = {
                    ocupado: true,
                    datos_clase: { ...clase, horas_clase: bloques },
                    bloque: bloquesCoinciden,
                    bloques_totales: bloques,
                  };
                  bloquesCoinciden++;
                }
              }
            });
          });
        });

        setTableHorarioOriginal(nuevaMatriz);
        return nuevaMatriz;
      });
    },
    [setTableHorario, setTableHorarioOriginal],
  );

  useEffect(() => {
    if (horario && turno) {
      obtenerClases(horario, turno);
    }
  }, [horario, turno, obtenerClases]);
};

// Hook principal de efectos
const useHorarioEffects = (props, state, stateSetters) => {
  // Efecto para carga inicial de horario
  useHorarioInitialization(props, stateSetters);
};

export default useHorarioEffects;
