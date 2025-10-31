import { useState } from "react";
import { UTILS } from "../../../utils/utils";

// Todos los estados del componente
const useHorarioState = () => {
  // Estado de la clase seleccionada
  const [selectedClass, setSelectedClass] = useState(null);
  // Estado de los Slots que están habilitados para un posible movimiento
  const [availableSlots, setAvailableSlots] = useState([]);
  // Estado para las unidades curriculares
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  // Estado para los profesores
  const [profesores, setProfesores] = useState([]);
  // Estado para las aulas
  const [aulas, setAulas] = useState([]);
  // Estado de unidad curricular seleccionada
  const [unidadCurricularSelected, setUnidadCurricularSelected] = useState([]);
  //Estado del profesor seleccionado
  const [profesorSelected, setProfesorSelected] = useState([]);
  // Estado para las aulas
  const [aulaSelected, setAulaSelected] = useState([]);
  // Estado del horario de Aula
  const [aulaHorario, setAulaHorario] = useState([]);
  // Estado para los horarios de los profesores
  const [profesorHorario, setProfesorHorario] = useState([]);
  // Estado para si se está ejecutando algo que utilice un cargador
  const [loading, setLoading] = useState(false);
  // Estado para la clase que se está por mover
  const [classToMove, setClassToMove] = useState(null);
  // Estado para slot original de una clase que se desea mover
  const [originalSlot, setOriginalSlot] = useState(null);
  // Estado para el overlay
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Estado de la tabla de horario
  const [tableHorario, setTableHorario] = useState(
    ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"].map(
      (dia) => ({ dia, horas: { ...UTILS.initialHours } })
    )
  );

  // Estado original de la tabla - mismo valor inicial
  const [tableHorarioOriginal, setTableHorarioOriginal] =
    useState(tableHorario);

  // Agrupar todos los setters para facilitar el paso a otros hooks
  const stateSetters = {
    setTableHorario,
    setSelectedClass,
    setAvailableSlots,
    setUnidadesCurriculares,
    setProfesores,
    setAulas,
    setProfesorHorario,
    setLoading,
    setClassToMove,
    setOriginalSlot,
    setOverlayVisible,
    setUnidadCurricularSelected,
    setAulaSelected,
    setProfesorSelected,
    setAulaHorario,
    setTableHorarioOriginal,
  };

  // Agrupar todos los estados para facilitar el acceso
  const state = {
    tableHorario,
    selectedClass,
    availableSlots,
    unidadesCurriculares,
    profesores,
    aulas,
    profesorHorario,
    loading,
    classToMove,
    originalSlot,
    overlayVisible,
    unidadCurricularSelected,
    profesorSelected,
    aulaSelected,
    aulaHorario,
    tableHorarioOriginal,
  };

  return {
    // Estados individuales
    ...state,

    // Setters individuales
    ...stateSetters,

    // Agrupados para conveniencia
    state,
    stateSetters,
  };
};

export default useHorarioState;
