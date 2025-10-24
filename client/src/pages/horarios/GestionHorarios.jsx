import { useEffect, useState, useCallback } from "react";
import Horario from "../../components/horario/Horario";
import ResponsiveAppBar from "../../components/navbar";
import {
  Box,
  Typography,
  Grid,
  Container,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import useApi from "../../hook/useApi";
import FiltroAcordeonHorario from "../../components/FiltroAcordeonHorario";
import LoadingCharge from "../../components/ui/LoadingCharge";

export default function GestionHorarios() {
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seccion, setSeccion] = useState(null);
  const [error, setError] = useState(null);
  const axios = useApi();

  // Efecto para cargar horario cuando se selecciona una sección
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!seccion?.id_seccion) {
        setHorario(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `/horarios/seccion/${seccion.id_seccion}`
        );
        console.log("📊 Respuesta del horario:", response);
        setHorario(response?.data || response || null);
      } catch (e) {
        console.error("Error al consultar el horario: ", e);
        setError("Error al cargar el horario. Intente nuevamente.");
        setHorario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [seccion, axios]);

  // Función para formatear el turno
  const formatearTurno = useCallback((turno) => {
    if (!turno) return { horaInicio: "07:00", horaFin: "20:30" };

    if (turno.horaInicio && turno.horaFin) {
      return turno;
    }

    if (typeof turno === "string") {
      const [inicio, fin] = turno.split("-");
      return {
        horaInicio: inicio?.trim() || "07:00",
        horaFin: fin?.trim() || "20:30",
      };
    }

    return { horaInicio: "07:00", horaFin: "20:30" };
  }, []);

  const manejarSeleccionSeccion = (seccion) => {
    setSeccion(seccion);
  };

  if (loading) {
    return <LoadingCharge charge={loading} />;
  }

  return (
    <>
      <ResponsiveAppBar backgroundColor={true} />
      <Container maxWidth="xl" sx={{ mt: 18, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <ScheduleIcon fontSize="large" />
            Gestión de Horarios
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Visualiza el horario académico por sección
          </Typography>
        </Box>

        {/* Layout principal con sidebar de filtros y contenido */}
        <Grid container spacing={4}>
          {/* Sidebar de Filtros */}
          <Grid item xs={12} md={4} lg={3}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <FiltroAcordeonHorario
                onSeccionSelect={manejarSeleccionSeccion}
                selectedSeccion={seccion}
              />
            </Box>
          </Grid>

          {/* Contenido principal */}
          <Grid item xs={12} md={8} lg={9}>
            {!seccion && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Selecciona una sección en el panel izquierdo para visualizar su
                horario
              </Alert>
            )}

            {/* Horario */}
            {horario ? (
              <Horario
                PNF={horario.pnf || horario.PNF}
                Turno={formatearTurno(horario.turno || horario.Turno)}
                Trayecto={horario.trayecto || horario.Trayecto}
                Seccion={{
                  seccion:
                    horario.valor_seccion || horario.Seccion?.valor_seccion,
                  idSeccion:
                    horario.idSeccion ||
                    horario.Seccion?.idSeccion ||
                    seccion?.id_seccion,
                }}
                Horario={horario.dias || horario.Horario}
                Custom={true}
              />
            ) : (
              seccion &&
              !loading && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <ScheduleIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom color="text.secondary">
                    No hay horario disponible
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    No se encontró horario para la sección seleccionada.
                  </Typography>
                </Box>
              )
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
