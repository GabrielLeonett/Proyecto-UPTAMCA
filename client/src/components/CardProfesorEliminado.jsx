import { useTheme } from "@emotion/react";
import CustomChip from "./CustomChip";
import ReplayIcon from "@mui/icons-material/Replay";
import { Typography, Box, Button, Stack, Paper, Grid } from "@mui/material";
import useApi from "../hook/useApi";
export default function CardProfesorEliminado({ prof }) {
  const axios = useApi();
  const handleRestaurar = async () => {
    try {
      await axios.put(`/Profesor/restaurar`);
    } catch (error) {
      console.error("Error al restaurar:", error);
    }
  };
  const theme = useTheme();
  const styles = {
    paper: {
      p: 3,
      borderRadius: 3,
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      border: "1px solid",
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.error.light
          : theme.palette.error.dark,
      boxShadow: theme.shadows[3],
    },
    eliminationSection: {
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.error.light
          : `${theme.palette.error.dark}30`,
      p: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor:
        theme.palette.mode === "light"
          ? theme.palette.error.main
          : theme.palette.error.dark,
    },
    eliminationText: {
      color:
        theme.palette.mode === "light"
          ? theme.palette.error.dark
          : theme.palette.error.light,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 2,
      objectFit: "cover",
      border: `2px solid ${
        theme.palette.mode === "light"
          ? theme.palette.grey[200]
          : theme.palette.grey[700]
      }`,
    },
    title: {
      variant: "h4",
      component: "h1",
      gutterBottom: true,
      fontWeight: "bold",
      color:
        theme.palette.mode === "light"
          ? theme.palette.primary.main
          : theme.palette.primary.light,
    },
    emptyState: {
      textAlign: "center",
      my: 6,
      color: theme.palette.text.secondary,
    },
  };
  return (
    <Paper key={prof.id_profesor} elevation={3} sx={styles.paper}>
      {/* Header con información principal */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            color={theme.palette.text.primary}
          >
            {prof.nombres} {prof.apellidos}
          </Typography>
          <CustomChip
            label="ELIMINADO"
            color="error"
            size="small"
            variant="filled"
          />
        </Box>
      </Box>

      {/* Información personal */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Cédula:</strong> {prof.cedula}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Género:</strong> {prof.genero}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Email:</strong> {prof.email}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Teléfono:</strong>{" "}
            {prof.telefono_movil || "No especificado"}
          </Typography>
        </Grid>
      </Grid>

      {/* Información académica y laboral */}
      <Box sx={styles.infoSection}>
        <Typography variant="subtitle2" gutterBottom>
          Información Académica
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Categoría:</strong>{" "}
              {prof.ultima_categoria || "No especificada"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Dedicación:</strong>{" "}
              {prof.ultima_dedicacion || "No especificada"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Tiempo de servicio:</strong> {prof.tiempo_servicio || 0}{" "}
              años
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Reingreso:</strong> {prof.tiene_reingreso ? "Sí" : "No"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Información de eliminación */}
      <Box sx={styles.eliminationSection}>
        <Typography
          variant="subtitle2"
          sx={styles.eliminationText}
          gutterBottom
        >
          Información de Eliminación
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={styles.eliminationText}>
              <strong>Motivo:</strong> {prof.razon || "No especificado"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={styles.eliminationText}>
              <strong>Fecha eliminación:</strong>{" "}
              {new Date(prof.fecha_eliminacion).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={styles.eliminationText}>
              <strong>Eliminado por:</strong> {prof.nombre_usuario_accion}
            </Typography>
          </Grid>
          {prof.observaciones && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={styles.eliminationText}>
                <strong>Observaciones:</strong> {prof.observaciones}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Áreas de conocimiento (si existen) */}
      {prof.areas_de_conocimiento && prof.areas_de_conocimiento.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Áreas de Conocimiento
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {prof.areas_de_conocimiento.map((area, index) => (
              <CustomChip
                key={index}
                label={area.nombre}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Acciones */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 2 }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => handleRestaurar(prof.id_profesor)}
          startIcon={<ReplayIcon />}
        >
          Restaurar
        </Button>
      </Stack>
    </Paper>
  );
}
