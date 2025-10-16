import { useEffect, useState, useCallback } from "react";
import Horario from "../../components/horario/Horario";
import ResponsiveAppBar from "../../components/navbar";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Container,
  Button,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import useApi from "../../hook/useApi";

export default function GestionHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const axios = useApi();

  // SOLUCIÓN: Separar la lógica de fetch del useCallback
  const fetchHorarios = async () => {
    const response = await axios.get("/Horarios");
    setHorarios(response || []);
  };

  // useEffect con dependencias controladas
  useEffect(() => {
    const abortController = new AbortController();

    fetchHorarios(abortController.signal);

    return () => {
      console.log("🧹 Cleanup useEffect");
      abortController.abort();
    };
  }, [refreshCount]); // Solo refreshCount como dependencia

  // Función para formatear el turno si es necesario
  const formatearTurno = useCallback((turno) => {
    if (!turno) return { horaInicio: "07:00", horaFin: "20:30" };

    // Si el turno ya tiene el formato correcto
    if (turno.horaInicio && turno.horaFin) {
      return turno;
    }

    // Si es un string, intentar parsearlo
    if (typeof turno === "string") {
      const [inicio, fin] = turno.split("-");
      return {
        horaInicio: inicio?.trim() || "07:00",
        horaFin: fin?.trim() || "20:30",
      };
    }

    // Valor por defecto
    return { horaInicio: "07:00", horaFin: "20:30" };
  }, []);

  // Función para recargar manualmente
  const handleRefresh = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    setRefreshCount((prev) => prev + 1);
  }, []);

  return (
    <>
      <ResponsiveAppBar backgroundColor={true} />
      <Container maxWidth="xl" sx={{ mt: 18, py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h2" component="h1" gutterBottom>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ScheduleIcon fontSize="large" />
                Gestión de Horarios
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Lista de Horarios */}
        {horarios && horarios.length > 0 ? (
          <Grid container spacing={4}>
            {horarios.map((horario) => (
              <Horario
                PNF={horario.pnf}
                Turno={formatearTurno(horario.turno)}
                Trayecto={horario.trayecto}
                Seccion={{
                  seccion: horario.seccion,
                  idSeccion: horario.idSeccion,
                }}
                Horario={horario.dias}
                Custom={false} // Solo vista, no edición
              />
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <ScheduleIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No hay horarios disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No se encontraron horarios en el sistema.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Intentar de nuevo
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}
