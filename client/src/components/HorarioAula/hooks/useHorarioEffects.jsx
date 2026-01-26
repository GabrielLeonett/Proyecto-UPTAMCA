import { useEffect, useCallback } from "react";
import { UTILS } from "../../../utils/utils.js";

// Efecto para carga inicial de horario
const useHorarioInitialization = (props, stateSetters) => {
  const { horario, turno } = props;
  const { setTableHorario, setTableHorarioOriginal } = stateSetters;

  const obtenerTurno = useCallback((turno) => {
    const horaInicioHHMM = UTILS.deshacerHora24(turno.hora_inicio);
    const horaFinHHMM = UTILS.deshacerHora24(turno.hora_fin);

    return { horaInicioHHMM, horaFinHHMM };
  }, []);

  const obtenerClases = useCallback(
    (Dias, turno) => {
      const { horaInicioHHMM, horaFinHHMM } = obtenerTurno(turno);

      // Filtrar horas dentro del turno
      const horasFiltradas = {};
      Object.keys(UTILS.initialHours).forEach((key) => {
        const horaHHMM = Number(key);
        if (horaHHMM >= horaInicioHHMM && horaHHMM <= horaFinHHMM) {
          horasFiltradas[key] = UTILS.initialHours[key];
        }
      });

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
            const inicio = UTILS.deshacerHora24(turno.hora_inicio);
            const fin = UTILS.deshacerHora24(turno.hora_fin)
            const bloques = Math.ceil((fin - inicio) / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicio + i * 45;
              const h = Math.floor(minutosActual / 60);
              const m = minutosActual % 60;
              const horaHHMM = h * 100 + m;

              // Verificar si la hora existe en las horas filtradas
              if (horasFiltradas[horaHHMM] !== undefined) {
                nuevaMatriz[idDia].horas[horaHHMM] = {
                  ocupado: true,
                  datos_clase: { ...clase, horas_clase: bloques },
                  bloque: i,
                  bloques_totales: bloques,
                };
              }
            }
          });
        });
        setTableHorarioOriginal(nuevaMatriz);
        return nuevaMatriz;
      });
    },
    [obtenerTurno, setTableHorario, setTableHorarioOriginal]
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
