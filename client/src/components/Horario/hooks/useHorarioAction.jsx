import { useCallback } from "react";
import { UTILS } from "../../utils/utils";

export const useHorarioActions = ({
  tableHorario,
  selectedClass,
  classToMove,
  newClass,
  setNewClass
}) => {
  const handleMoveRequest = useCallback((clase) => {
    // Implementar lógica
  }, []);

  const cancelarMovimiento = useCallback(() => {
    // Implementar lógica
  }, []);

  // ... otras acciones

  return {
    handleMoveRequest,
    cancelarMovimiento,
    handleSlotClick,
    handleProfesorChange,
    handleAulaChange,
    handleUnidadChange,
    enviarHorarioAlBackend
  };
};