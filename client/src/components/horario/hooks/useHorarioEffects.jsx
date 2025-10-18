import { useEffect, useCallback } from "react";
import { UTILS } from "../../../utils/utils";

// Efecto para carga inicial de horario
const useHorarioInitialization = (props, stateSetters) => {
  const { Horario, Turno } = props;
  const { setTableHorario } = stateSetters;

  const obtenerTurno = useCallback((Turno) => {
    const [horaInicio, minInicio] = Turno.horaInicio.split(":");
    const [horaFin, minFin] = Turno.horaFin.split(":");

    const MinutosInicio = UTILS.horasMinutos(horaInicio, minInicio);
    const MinutosFin = UTILS.horasMinutos(horaFin, minFin);

    const horaInicioHHMM = UTILS.calcularHorasHHMM(MinutosInicio);
    const horaFinHHMM = UTILS.calcularHorasHHMM(MinutosFin);

    return { horaInicioHHMM, horaFinHHMM };
  }, []);

  const obtenerClases = useCallback((Dias, Turno) => {
    const { horaInicioHHMM, horaFinHHMM } = obtenerTurno(Turno);

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
          const [hIni, mIni] = clase.horaInicio.split(":");
          const [hFin, mFin] = clase.horaFin.split(":");
          const inicio = UTILS.horasMinutos(hIni, mIni);
          const fin = UTILS.horasMinutos(hFin, mFin);
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
                datosClase: { ...clase, horasClase: bloques },
                bloque: i,
                bloquesTotales: bloques,
              };
            }
          }
        });
      });
      return nuevaMatriz;
    });
  }, [obtenerTurno, setTableHorario]);

  useEffect(() => {
    if (Horario && Turno) {
      obtenerClases(Horario, Turno);
    }
  }, [Horario, Turno, obtenerClases]);
};

// Efecto para nueva clase completa
const useNewClassEffect = (state, actions) => {
  const { newClass } = state;
  const { calcularHorariosDisponibles, crearClaseEnHorario } = actions;

  useEffect(() => {
    if (newClass.aula && newClass.profesor && newClass.unidad) {
      calcularHorariosDisponibles({
        idProfesor: newClass.profesor.id_profesor,
        horasClase: newClass.unidad.horas_clase,
      });
      crearClaseEnHorario();
    }
  }, [newClass, calcularHorariosDisponibles, crearClaseEnHorario]);
};

// Efecto para horarios de profesores
const useProfesoresHorariosEffect = (state, stateSetters, dataFetchers) => {
  const { profesores } = state;
  const { setLoading } = stateSetters;
  const { fetchProfesoresHorarios } = dataFetchers;

  useEffect(() => {
    if (profesores && profesores.length > 0) {
      fetchProfesoresHorarios(profesores);
    }
  }, [profesores, fetchProfesoresHorarios, setLoading]);
};

// Efecto para recalcular cuando cambia clase seleccionada
const useSelectedClassEffect = (state, actions) => {
  const { selectedClass, classToMove } = state;
  const { calcularHorariosDisponibles } = actions;

  useEffect(() => {
    if (selectedClass && !classToMove) {
      calcularHorariosDisponibles(selectedClass);
    }
  }, [selectedClass, classToMove, calcularHorariosDisponibles]);
};

// Efecto para carga de datos iniciales
const useInitialDataEffect = (props, state, stateSetters, dataFetchers) => {
  const { tableHorario, newClass } = state;
  const { setLoading } = stateSetters;
  const { fetchAllInitialData, fetchProfesoresData } = dataFetchers;

  useEffect(() => {
    if (tableHorario.length > 0) {
      const loadInitialData = async () => {
        setLoading(true);
        try {
          await fetchAllInitialData(tableHorario);
          
          // Si hay una unidad seleccionada, cargar profesores
          if (newClass.unidad) {
            await fetchProfesoresData(newClass.unidad);
          }
        } catch (error) {
          console.error("Error cargando datos iniciales:", error);
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();
    }
  }, [tableHorario, newClass.unidad, fetchAllInitialData, fetchProfesoresData, setLoading]);
};

// Hook principal de efectos
const useHorarioEffects = (props, state, actions, dataFetchers, stateSetters) => {
  // Efecto para carga inicial de horario
  useHorarioInitialization(props, stateSetters);

  // Efecto para nueva clase completa
  useNewClassEffect(state, actions);

  // Efecto para horarios de profesores
  useProfesoresHorariosEffect(state, stateSetters, dataFetchers);

  // Efecto para recalcular cuando cambia clase seleccionada
  useSelectedClassEffect(state, actions);

  // Efecto para carga de datos iniciales
  useInitialDataEffect(props, state, stateSetters, dataFetchers);
};

export default useHorarioEffects;