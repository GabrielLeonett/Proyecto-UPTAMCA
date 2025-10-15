import { useState } from "react";
import {UTILS} from '../../../utils/utils'

// Todos los estados del componente
const useHorarioState = (initialProps = {}) => {
  // Estado de la clase seleccionada
  const [selectedClass, setSelectedClass] = useState(null);
  // Estado de los Slots que están habilitados para un posible movimiento
  const [availableSlots, setAvailableSlots] = useState([]);
  // Estado para la nueva clase que se pueda crear
  const [newClass, setNewClass] = useState({
    profesor: null,
    unidad: null,
    aula: null,
  });
  // Estado para las unidades curriculares
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  // Estado para los profesores
  const [profesores, setProfesores] = useState([]);
  // Estado para las aulas
  const [aulas, setAulas] = useState([]);
  // Estado para los horarios de los profesores
  const [profesoresHorarios, setProfesoresHorarios] = useState([]);
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
    ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map(
      (dia) => ({ dia, horas: { ...UTILS.initialHours } })
    )
  );

  // Agrupar todos los setters para facilitar el paso a otros hooks
  const stateSetters = {
    setTableHorario,
    setSelectedClass,
    setAvailableSlots,
    setNewClass,
    setUnidadesCurriculares,
    setProfesores,
    setAulas,
    setProfesoresHorarios,
    setLoading,
    setClassToMove,
    setOriginalSlot,
    setOverlayVisible,
  };

  // Agrupar todos los estados para facilitar el acceso
  const state = {
    tableHorario,
    selectedClass,
    availableSlots,
    newClass,
    unidadesCurriculares,
    profesores,
    aulas,
    profesoresHorarios,
    loading,
    classToMove,
    originalSlot,
    overlayVisible,
  };

  return {
    // Estados individuales
    ...state,
    
    // Setters individuales
    setTableHorario,
    setSelectedClass,
    setAvailableSlots,
    setNewClass,
    setUnidadesCurriculares,
    setProfesores,
    setAulas,
    setProfesoresHorarios,
    setLoading,
    setClassToMove,
    setOriginalSlot,
    setOverlayVisible,
    
    // Agrupados para conveniencia
    state,
    stateSetters,
  };
};

export default useHorarioState;