import { Box, Typography, Button } from "@mui/material";
import { useState, useCallback } from "react";
import HorarioTable from "./HorarioTable";
import HorarioControls from "./HorarioControls";
import HorarioStatus from "./HorarioStatus";
import { useHorarioData } from "./hooks/useHorarioData";
import { useHorarioActions } from "./hooks/useHorarioActions";

export default function Horario({ PNF, Trayecto, Seccion, Horario, Turno, Custom }) {
  const {
    tableHorario,
    selectedClass,
    classToMove,
    availableSlots,
    newClass,
    unidadesCurriculares,
    profesores,
    aulas,
    loading
  } = useHorarioData({ PNF, Trayecto, Seccion, Horario, Turno, Custom });

  const {
    handleMoveRequest,
    cancelarMovimiento,
    handleSlotClick,
    handleProfesorChange,
    handleAulaChange,
    handleUnidadChange,
    enviarHorarioAlBackend
  } = useHorarioActions({
    tableHorario,
    selectedClass,
    classToMove,
    newClass,
    setNewClass: useCallback((value) => {
      // Implementar según tu estado actual
    }, [])
  });

  return (
    <Box component={"div"} sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "2rem",
    }}>
      <HorarioStatus 
        selectedClass={selectedClass}
        classToMove={classToMove}
        cancelarMovimiento={cancelarMovimiento}
      />

      <HorarioTable
        PNF={PNF}
        Trayecto={Trayecto}
        Seccion={Seccion}
        tableHorario={tableHorario}
        availableSlots={availableSlots}
        selectedClass={selectedClass}
        classToMove={classToMove}
        Custom={Custom}
        onSlotClick={handleSlotClick}
        onMoveRequest={handleMoveRequest}
        onSave={enviarHorarioAlBackend}
      />

      {Custom && (
        <HorarioControls
          newClass={newClass}
          unidadesCurriculares={unidadesCurriculares}
          profesores={profesores}
          aulas={aulas}
          onUnidadChange={handleUnidadChange}
          onProfesorChange={handleProfesorChange}
          onAulaChange={handleAulaChange}
        />
      )}
    </Box>
  );
}