import { useCallback } from "react";
import { useProfessorAvailability } from "./useProfessorAvailability";
import { useSlotCalculations } from "./useSlotCalculations";
import {
  findOriginalSlot,
  liberarSlotOriginal,
  ocuparNuevoSlot,
} from "../utils/movementUtils";
import useSweetAlert from "../../../hook/useSweetAlert";

const useClassMovement = (state, stateSetters, utils) => {
  const alert = useSweetAlert();
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
    setAulaSelected,
    setProfesorSelected,
    setUnidadCurricularSelected,
  } = stateSetters;

  const { verificarDisponibilidadProfesor } = useProfessorAvailability();

  const { procesarDisponibilidadDocente, validarDatosClase } =
    useSlotCalculations();

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

      console.log(
        "Estos son los slots disponibles para poder hacer la insercion:",
        slotsDisponibles
      );

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
    [
      tableHorario,
      setClassToMove,
      setOriginalSlot,
      setSelectedClass,
      calcularHorariosDisponibles,
    ]
  );
  const handleCancelMoveRequest = useCallback(() => {
    setClassToMove({});
    setSelectedClass({});
    setOriginalSlot({});
  }, [setClassToMove, setOriginalSlot, setSelectedClass]);

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
      setProfesorSelected({});
      setUnidadCurricularSelected({});
      setAulaSelected({});

      // Mostrar mensaje de éxito
      alert.success(
        "Clase Movida",
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
      setAulaSelected,
      setProfesorSelected,
      setUnidadCurricularSelected,
      utils,
      alert,
    ]
  );

  return {
    handleMoveRequest,
    cancelarMovimiento,
    completarMovimiento,
    calcularHorariosDisponibles,
    handleCancelMoveRequest,
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
