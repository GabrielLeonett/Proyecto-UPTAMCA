import { useCallback, useEffect } from "react";

// Función auxiliar para verificar unidades curriculares existentes (fuera del hook)
const verificarSiExisteUnidadCurricular = (unidades, tableHorario) => {
  if (!unidades || unidades.length === 0) return unidades;

  const idsUnidadesExistentes = new Set();
  const unidadesExistentes = [];

  // Recorrer el horario para encontrar unidades existentes
  tableHorario.forEach((dia) => {
    Object.values(dia.horas).forEach((horaActual) => {
      if (horaActual?.datosClase?.idUnidadCurricular) {
        const existeUnidad = unidades.find(
          (unidad) =>
            unidad.id_unidad_curricular ===
            horaActual.datosClase.idUnidadCurricular
        );

        if (
          existeUnidad &&
          !idsUnidadesExistentes.has(horaActual.datosClase.idUnidadCurricular)
        ) {
          unidadesExistentes.push({
            ...existeUnidad,
            esVista: true,
          });
          idsUnidadesExistentes.add(horaActual.datosClase.idUnidadCurricular);
        }
      }
    });
  });

  // Actualizar todas las unidades con la propiedad esVista
  return unidades.map((unidad) => {
    const existe = unidadesExistentes.some(
      (u) => u.id_unidad_curricular === unidad.id_unidad_curricular
    );
    return {
      ...unidad,
      esVista: existe,
    };
  });
};

// Función para validar si las unidades curriculares están inicializadas
const validarUnidadesCurricularesInicializadas = (unidades) => {
  return (
    unidades &&
    Array.isArray(unidades) &&
    unidades.length > 0 &&
    unidades.every(
      (unidad) =>
        unidad &&
        typeof unidad === "object" &&
        unidad.id_unidad_curricular !== undefined &&
        unidad.horas_clase !== undefined
    )
  );
};

// Hook principal de datos
const useHorarioData = (axios, props, state, stateSetters, Custom) => {
  const {
    setUnidadesCurriculares,
    setAulas,
    setProfesores,
    setProfesorHorario,
    setLoading,
  } = stateSetters;
  const { profesorSelected, unidadCurricularSelected, unidadesCurriculares, tableHorario } =
    state;
  const { Trayecto, Seccion } = props;

  // Fetch de unidades curriculares CON useCallback
  const fetchUnidadesCurriculares = useCallback(
    async (tableHorarioParam = null) => {
      if (!Custom) {
        console.warn("Custom no está disponible");
        return;
      }

      if (!Trayecto?.id_trayecto) {
        console.warn("Trayecto no está definido o no tiene id_trayecto");
        return;
      }

      try {
        const res = await axios.get(
          `/trayectos/${Trayecto.id_trayecto}/unidades-curriculares`
        );

        if (
          !res ||
          !res.unidades_curriculares ||
          !Array.isArray(res.unidades_curriculares)
        ) {
          console.error("Respuesta inválida de unidades curriculares:", res);
          return;
        }

        // Usar el tableHorario del parámetro o del estado
        const horarioParaVerificar = tableHorarioParam || tableHorario;

        const unidadesActualizadas = verificarSiExisteUnidadCurricular(
          res.unidades_curriculares,
          horarioParaVerificar
        );

        if (validarUnidadesCurricularesInicializadas(unidadesActualizadas)) {
          setUnidadesCurriculares(unidadesActualizadas);
        } else {
          console.error(
            "Unidades curriculares no tienen la estructura esperada"
          );
          setUnidadesCurriculares([]);
        }
      } catch (error) {
        console.error("Error cargando unidades curriculares:", error);
        setUnidadesCurriculares([]);
      }
    },
    [Custom, Trayecto?.id_trayecto, axios, setUnidadesCurriculares, tableHorario]
  );

  // Fetch de profesores CON useCallback
  const fetchProfesores = useCallback(async () => {
    if (!Custom) {
      console.warn("Custom no está disponible");
      return;
    }

    if (!validarUnidadesCurricularesInicializadas(unidadesCurriculares)) {
      console.warn(
        "Unidades curriculares no están inicializadas o no son válidas"
      );
      return;
    }

    if (!unidadCurricularSelected || !unidadCurricularSelected.horas_clase) {
      console.log(unidadCurricularSelected);
      console.warn(
        "No hay unidad curricular seleccionada o no tiene horas_clase definidas"
      );
      return;
    }

    if (!Seccion?.idSeccion) {
      console.warn("Sección no está definida o no tiene idSeccion");
      return;
    }

    try {
      const profesores = await axios.post(
        `/profesores/to/seccion/${Seccion.idSeccion}`,
        {
          horasNecesarias: unidadCurricularSelected.horas_clase,
        }
      );
      console.log(
        "Estos son los profesores que se pueden seleccionar:",
        profesores
      );
      if (profesores && Array.isArray(profesores)) {
        setProfesores(profesores);
      } else {
        console.error("Respuesta de profesores inválida:", profesores);
        setProfesores([]);
      }
    } catch (error) {
      console.error("Error cargando profesores:", error);
      setProfesores([]);
    }
  }, [
    Custom,
    unidadesCurriculares,
    unidadCurricularSelected,
    Seccion?.idSeccion,
    axios,
    setProfesores,
  ]);

  // Fetch del horario del profesor CON useCallback
  const fetchProfesoresHorario = useCallback(
    async (profesor) => {
      if (!Custom) {
        console.warn("Custom no está disponible");
        return;
      }

      if (!profesor) {
        console.warn("No se proporcionó un profesor para obtener el horario");
        return;
      }

      // Obtener la cédula del profesor
      const cedulaProfesor = profesor.cedula || profesor.cedula_profesor;

      if (!cedulaProfesor) {
        console.warn("El profesor no tiene cédula definida");
        return;
      }

      try {
        setLoading(true);
        console.log(
          `Obteniendo horario del profesor con cédula: ${cedulaProfesor}`
        );

        const horario = await axios.get(`/horarios/profesor/${cedulaProfesor}`);

        console.log("Horario del profesor obtenido:", horario);

        if (horario) {
          setProfesorHorario(horario);
        } else {
          console.error("Respuesta de horario del profesor inválida:", horario);
          setProfesorHorario(null);
        }
      } catch (error) {
        console.error("Error cargando horario del profesor:", error);
        setProfesorHorario(null);
      } finally {
        setLoading(false);
      }
    },
    [Custom, axios, setProfesorHorario, setLoading]
  );

  // Fetch de aulas CON useCallback
  const fetchAulas = useCallback(async () => {
    if (!Custom) {
      console.warn("Custom no está disponible");
      return;
    }

    if (!validarUnidadesCurricularesInicializadas(unidadesCurriculares)) {
      console.warn(
        "Unidades curriculares no están inicializadas o no son válidas"
      );
      return;
    }

    if (!unidadCurricularSelected || !unidadCurricularSelected.horas_clase) {
      console.warn(
        "No hay unidad curricular seleccionada o no tiene horas_clase definidas"
      );
      return;
    }

    if (!Seccion?.idSeccion) {
      console.log(Seccion);
      console.warn("Sección no está definida o no tiene idSeccion");
      return;
    }

    if (
      !profesorSelected ||
      (!profesorSelected.id_profesor && !profesorSelected.idProfesor)
    ) {
      console.warn("No hay profesor seleccionado o no tiene ID válido");
      return;
    }

    try {
      const idProfesor =
        profesorSelected.id_profesor || profesorSelected.idProfesor;

      const aulas = await axios.post(`/aulas/to/seccion/${Seccion.idSeccion}`, {
        idProfesor,
        horasNecesarias: unidadCurricularSelected.horas_clase,
      });

      if (aulas && Array.isArray(aulas)) {
        setAulas(aulas);
      } else {
        console.error("Respuesta de aulas inválida:", aulas);
        setAulas([]);
      }
    } catch (error) {
      console.error("Error cargando aulas:", error);
      setAulas([]);
    }
  }, [
    Custom,
    unidadesCurriculares,
    unidadCurricularSelected,
    Seccion,
    profesorSelected,
    axios,
    setAulas,
  ]);

  // Efecto para cargar unidades curriculares automáticamente al inicio
  useEffect(() => {
    if (Custom && Trayecto?.id_trayecto && tableHorario) {
      console.log("Cargando unidades curriculares iniciales...");
      fetchUnidadesCurriculares();
    }
  }, [Custom, Trayecto?.id_trayecto, tableHorario, fetchUnidadesCurriculares]);

  // Efecto para cargar profesores automáticamente
  useEffect(() => {
    if (unidadCurricularSelected && unidadesCurriculares.length > 0) {
      console.log("Unidad curricular seleccionada, cargando profesores...");
      fetchProfesores();
    }
  }, [unidadCurricularSelected, unidadesCurriculares, fetchProfesores]);

  // Efecto para cargar horario del profesor automáticamente
  useEffect(() => {
    if (
      profesorSelected &&
      (profesorSelected.cedula || profesorSelected.cedula_profesor)
    ) {
      console.log("Profesor seleccionado, cargando horario...");
      fetchProfesoresHorario(profesorSelected);
    }
  }, [profesorSelected, fetchProfesoresHorario]);

  // Efecto para cargar aulas automáticamente
  useEffect(() => {
    if (
      profesorSelected &&
      unidadCurricularSelected &&
      unidadesCurriculares.length > 0
    ) {
      console.log("Profesor seleccionado, cargando aulas...");
      fetchAulas();
    }
  }, [
    profesorSelected,
    unidadCurricularSelected,
    unidadesCurriculares,
    fetchAulas,
  ]);

  return {
    // Funciones individuales
    fetchUnidadesCurriculares,
    fetchAulas,
    fetchProfesores,
    fetchProfesoresHorario,
  };
};

export default useHorarioData;