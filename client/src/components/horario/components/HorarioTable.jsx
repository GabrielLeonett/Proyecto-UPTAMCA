import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Class as ClassIcon,
} from "@mui/icons-material";
import Clase from "./clase";
import { UTILS } from "../../../utils/utils";

// Solo la tabla del horario
const HorarioTable = ({
  tableHorario,
  isSlotAvailable,
  handleSlotClick,
  handleMoveRequest,
  selectedClass,
  Custom,
  PNF,
  Trayecto,
  Seccion,
}) => {
  const theme = useTheme();

  // Ordenar las horas
  const horasOrdenadas = Object.keys(tableHorario[0]?.horas || {})
    .map(Number)
    .sort((a, b) => a - b);

  const getHeaderTitle = () => {
    const parts = [];
    if (PNF) parts.push(PNF);
    if (Trayecto) parts.push(`Trayecto ${Trayecto}`);
    if (Seccion?.seccion) parts.push(`Sección ${Seccion.seccion}`);
    return parts.join(" • ");
  };

  const getCellBackgroundColor = (diaIndex, hora, celda, disponible) => {
    if (disponible) {
      return alpha(theme.palette.success.main, 0.1);
    }
    if (celda?.ocupado) {
      return alpha(theme.palette.primary.main, 0.05);
    }
    return "transparent";
  };

  const getCellBorderColor = (diaIndex, hora, celda, disponible) => {
    if (disponible) {
      return theme.palette.success.main;
    }
    return theme.palette.divider;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 1000 }} size="small">
          {/* Header Principal */}
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={7}
                align="center"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  py: 2,
                  borderBottom: `2px solid ${theme.palette.primary.dark}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <ClassIcon />
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {getHeaderTitle()}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>

            {/* Header de Días */}
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[100],
                  border: `1px solid ${theme.palette.divider}`,
                  fontWeight: "bold",
                  width: 120,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon fontSize="small" />
                  <span>Hora</span>
                </Box>
              </TableCell>
              {tableHorario.map((columna) => (
                <TableCell
                  key={columna.dia}
                  align="center"
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.grey[50],
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {columna.dia}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {horasOrdenadas.map((hora) => (
              <TableRow
                key={hora}
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                {/* Celda de Hora */}
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.divider}`,
                    whiteSpace: "nowrap",
                    fontWeight: "medium",
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    background: theme.palette.background.paper,
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {UTILS.formatearHora(hora)}
                  </Typography>
                </TableCell>

                {/* Celdas de cada día */}
                {tableHorario.map((columna, diaIndex) => {
                  const celda = columna.horas[hora];
                  const cellKey = `${columna.dia}-${hora}`;
                  const disponible =
                    selectedClass && isSlotAvailable(diaIndex, hora);

                  // Omitir celdas que no son el primer bloque de una clase
                  if (celda?.ocupado && celda.bloque !== 0) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={cellKey}
                      rowSpan={celda?.ocupado ? celda.bloquesTotales : 1}
                      sx={{
                        padding: 0,
                        verticalAlign: "top",
                        height: celda?.ocupado
                          ? `${celda.bloquesTotales * 60}px`
                          : "60px",
                        border: `1px solid ${getCellBorderColor(
                          diaIndex,
                          hora,
                          celda,
                          disponible
                        )}`,
                        minWidth: 140,
                        backgroundColor: getCellBackgroundColor(
                          diaIndex,
                          hora,
                          celda,
                          disponible
                        ),
                        position: "relative",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": disponible
                          ? {
                              backgroundColor: alpha(
                                theme.palette.success.main,
                                0.2
                              ),
                              cursor: "pointer",
                              transform: "scale(0.98)",
                              boxShadow: `0 0 0 2px ${theme.palette.success.main}`,
                            }
                          : {},
                      }}
                      onClick={() =>
                        disponible && handleSlotClick(diaIndex, hora)
                      }
                    >
                      {celda?.ocupado ? (
                        <Clase
                          clase={celda.datosClase}
                          {...(Custom && {
                            onMoveRequest: handleMoveRequest,
                            isSelected:
                              selectedClass?.id === celda.datosClase?.id,
                          })}
                        />
                      ) : (
                        disponible && (
                          <Box
                            sx={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              gap: 0.5,
                              p: 1,
                            }}
                          >
                            <Chip
                              icon={<ClassIcon />}
                              label="Disponible"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                            <Typography
                              variant="caption"
                              color="success.main"
                              textAlign="center"
                              sx={{ fontWeight: "medium" }}
                            >
                              Click para asignar
                            </Typography>
                          </Box>
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HorarioTable;
