import { useCallback } from "react";
import { useProfessorAvailability } from "./useProfessorAvailability";
import { useSlotCalculations } from "./useSlotCalculations";
import {
  findOriginalSlot,
  liberarSlotOriginal,
  ocuparNuevoSlot,
} from "../utils/movementUtils";

const useClassMovement = (state, stateSetters, utils) => {
  const {
    tableHorario,
    profesorSelected,
    profesorHorarios,
    classToMove,
    originalSlot,
  } = state;

  const {
    setTableHorario,
    setClassToMove,
    setOriginalSlot,
    setSelectedClass,
    setAvailableSlots,
    setNewClass,
  } = stateSetters;

  const { verificarDisponibilidadProfesor } = useProfessorAvailability();
  
  const { procesarDisponibilidadDocente, validarDatosClase } =
    useSlotCalculations();

  // Manejar solicitud de movimiento
  const handleMoveRequest = useCallback(
    (clase) => {
      setClassToMove(clase);

      const original = findOriginalSlot(clase, tableHorario);
      setOriginalSlot(original);

      if (original) {
        setSelectedClass(clase);
        calcularHorariosDisponibles(clase);
      }
    },
    [tableHorario, setClassToMove, setOriginalSlot, setSelectedClass]
  );

  // Cancelar movimiento
  const cancelarMovimiento = useCallback(() => {
    setClassToMove(null);
    setOriginalSlot(null);
    setAvailableSlots([]);
    setSelectedClass(null);
  }, [setClassToMove, setOriginalSlot, setAvailableSlots, setSelectedClass]);

  // Completar movimiento
  const completarMovimiento = useCallback(
    (nuevoSlot) => {
      if (!classToMove) return;

      setTableHorario((prev) => {
        let nuevaMatriz = liberarSlotOriginal(originalSlot, prev);
        nuevaMatriz = ocuparNuevoSlot(nuevoSlot, classToMove, nuevaMatriz);
        return nuevaMatriz;
      });

      // Limpiar estados
      setClassToMove(null);
      setOriginalSlot(null);
      setAvailableSlots([]);
      setSelectedClass(null);
      setNewClass({ profesor: null, unidad: null, aula: null });

      // Mostrar mensaje de éxito
      alert(
        `Clase movida exitosamente a ${utils.obtenerDiaNombre(
          nuevoSlot.diaIndex
        )} ${utils.formatearHora(nuevoSlot.horaInicio)}`
      );
    },
    [
      classToMove,
      originalSlot,
      setTableHorario,
      setClassToMove,
      setOriginalSlot,
      setAvailableSlots,
      setSelectedClass,
      setNewClass,
      utils,
    ]
  );

  // Calcular horarios disponibles
  const calcularHorariosDisponibles = useCallback(
    (clase) => {
      const bloquesNecesarios = validarDatosClase(clase);
      if (!bloquesNecesarios) {
        setAvailableSlots([]);
        return;
      }

      if (!profesorSelected) {
        console.warn(`Profesor con ID ${clase.idProfesor} no encontrado`);
        setAvailableSlots([]);
        return;
      }

      if (
        !profesorSelected.disponibilidades ||
        profesorSelected.disponibilidades.length === 0
      ) {
        console.warn("Profesor no tiene disponibilidad definida");
        setAvailableSlots([]);
        return;
      }

      const slotsDisponibles = [];

      profesorSelected.disponibilidades.forEach((disponibilidad) => {
        if (
          !disponibilidad.dia_semana ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin
        ) {
          console.warn("Disponibilidad con datos incompletos", disponibilidad);
          return;
        }

        const slots = procesarDisponibilidadDocente(
          disponibilidad,
          bloquesNecesarios,
          tableHorario,
          (profesorId, diaIndex, horaInicio, bloques) =>
            verificarDisponibilidadProfesor(
              profesorId,
              diaIndex,
              horaInicio,
              bloques,
              profesorHorarios
            ),
          clase
        );

        slotsDisponibles.push(...slots);
      });

      setAvailableSlots(slotsDisponibles);
    },
    [
      validarDatosClase,
      profesorSelected,
      tableHorario,
      profesorHorarios,
      setAvailableSlots,
      procesarDisponibilidadDocente,
      verificarDisponibilidadProfesor,
    ]
  );

  return {
    handleMoveRequest,
    cancelarMovimiento,
    completarMovimiento,
    calcularHorariosDisponibles,
    verificarDisponibilidadProfesor: (
      profesorId,
      diaIndex,
      horaInicio,
      bloquesNecesarios
    ) =>
      verificarDisponibilidadProfesor(
        profesorId,
        diaIndex,
        horaInicio,
        bloquesNecesarios,
        profesorHorarios
      ),
  };
};

export default useClassMovement;
