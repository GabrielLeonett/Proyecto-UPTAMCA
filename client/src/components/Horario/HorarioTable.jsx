import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from "@mui/material";
import HorarioCell from "./HorarioCell";
import HorarioOverlay from "./HorarioOverlay";
import CustomButton from "../customButton";

export default function HorarioTable({
  PNF,
  Trayecto,
  Seccion,
  tableHorario,
  availableSlots,
  selectedClass,
  classToMove,
  Custom,
  onSlotClick,
  onMoveRequest,
  onSave
}) {
  // Lógica específica de la tabla aquí

  return (
    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignContent: "center", position: "relative" }}>
      <Box sx={{ position: "relative", cursor: overlayVisible ? "pointer" : "default" }}>
        {Custom ?? <HorarioOverlay isVisible={overlayVisible} Custom={Custom} />}
        
        <TableContainer>
          <Table sx={{ border: "1px solid black", width: "1000px" }}>
            {/* Encabezado de la tabla */}
            <TableBody>
              {/* Filas de la tabla */}
              {horasOrdenadas.map((hora) => (
                <TableRow key={hora}>
                  {/* Celdas */}
                  {tableHorario.map((columna, diaIndex) => (
                    <HorarioCell
                      key={`${columna.dia}-${hora}`}
                      columna={columna}
                      hora={hora}
                      diaIndex={diaIndex}
                      availableSlots={availableSlots}
                      selectedClass={selectedClass}
                      onSlotClick={onSlotClick}
                      onMoveRequest={onMoveRequest}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {Custom && (
          <Box sx={{ margin: "0%", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2rem" }}>
            <CustomButton variant="contained" sx={{ borderRadius: "0px 5px 5px 0px", backgroundColor: "#72ff5fff" }} onClick={onSave}>
              Guardar
            </CustomButton>
            {/* Otros botones */}
          </Box>
        )}
      </Box>
    </Box>
  );
}