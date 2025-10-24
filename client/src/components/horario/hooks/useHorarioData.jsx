import { useCallback } from "react";

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

// Hook principal de datos
const useHorarioData = (axios, props, stateSetters, Custom) => {
  const {
    setUnidadesCurriculares,
    setAulas,
    setProfesores,
    setProfesoresHorarios,
    setLoading,
  } = stateSetters;

  const { Trayecto, PNF } = props;

  // Fetch de unidades curriculares - SIN useCallback para evitar dependencias circulares
  const fetchUnidadesCurriculares = async (tableHorario) => {
    if (!Custom) return;
    try {
      const res = await axios.get(
        `/trayectos/${Trayecto.id_trayecto}/unidades-curriculares`
      );
      const unidadesActualizadas = verificarSiExisteUnidadCurricular(
        res.unidades_curriculares,
        tableHorario
      );

      setUnidadesCurriculares(unidadesActualizadas);
    } catch (error) {
      console.error("Error cargando unidades curriculares:", error);
    }
  };

  // Fetch de aulas - SIN useCallback
  const fetchAulas = async () => {
    if (!Custom) return;
    try {
      const aulas = await axios.get(`/Aulas/to/Horarios?pnf=${PNF}`);
      setAulas(aulas);
      return { success: true, data: aulas };
    } catch (error) {
      console.error("Error cargando aulas:", error);
      return { success: false, error };
    }
  };

  // Fetch de profesores - SIN useCallback
  const fetchProfesores = async (horasClase) => {
    if (!Custom) return;
    try {
      const profesores = await axios.get(
        `/Profesores/to/Horarios?horasNecesarias=${horasClase}`
      );
      setProfesores(profesores);
      return { success: true, data: profesores };
    } catch (error) {
      console.error("Error cargando profesores:", error);
      return { success: false, error };
    }
  };

  // Fetch de horarios de profesores - SIN useCallback
  const fetchProfesoresHorarios = async (profesores) => {
    if (!Custom) return;
    setLoading(true);
    try {
      const horariosPromises = profesores.map((profesor) =>
        axios.get(`/Horarios/Profesores?Profesor=${profesor.id_profesor}`)
      );

      const responses = await Promise.all(horariosPromises);
      const horarios = responses.map((response) => response || response);

      setProfesoresHorarios(horarios);
      return { success: true, data: horarios };
    } catch (error) {
      console.error("Error cargando horarios de profesores:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar todos los datos iniciales - CON useCallback pero sin dependencias problemáticas
  const fetchAllInitialData = useCallback(async (tableHorario) => {
    setLoading(true);
    await fetchUnidadesCurriculares(tableHorario);
    await fetchAulas();
    setLoading(false);
  }, []); // Solo setLoading como dependencia

  // Función para cargar datos de profesores basados en unidad seleccionada - CON useCallback
  const fetchProfesoresData = useCallback(async (unidad) => {
    if (!unidad) return { success: false, error: "No hay unidad seleccionada" };
    const profesoresResult = await fetchProfesores(unidad.horas_clase);
    if (profesoresResult.success) {
      await fetchProfesoresHorarios(profesoresResult.data);
    }
  }, []); // Sin dependencias - las funciones fetch son estables

  // Función para obtener datos de profesores (alias)
  const fetchDataForNewClass = fetchProfesoresData;

  return {
    // Funciones individuales (sin useCallback - son estables)
    fetchUnidadesCurriculares,
    fetchAulas,
    fetchProfesores,
    fetchProfesoresHorarios,

    // Funciones combinadas (con useCallback controlado)
    fetchAllInitialData,
    fetchProfesoresData,

    // Alias
    fetchDataForNewClass,
  };
};

export default useHorarioData;
