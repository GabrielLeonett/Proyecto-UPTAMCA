import {
  Grid,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import coordinadorSchema from "../schemas/coordinador.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function CardCoordinador({ coordinador }) {
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(coordinadorSchema),
  });
  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        padding: "30px",
        borderRadius: "25px",
        alignItems: "flex-start",
        width: { xs: "100%", sm: 500, md: 600 }, // Diferentes tamaños por breakpoint
        minWidth: 300,
        maxWidth: "100%",
        margin: "0 auto",
      }}
      spacing={3}
    >
      {/* Sección de imagen con gradiente */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Avatar
            variant="square"
            src={`https://ui-avatars.com/api/?name=${
              coordinador?.nombres || "Profesor"
            }+${coordinador?.apellidos || ""}`}
            alt={`${coordinador?.nombres} ${coordinador?.apellidos}`}
            sx={{
              width: "100%",
              height: "auto",
            }}
          />

          {/* Gradiente overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            }}
          />

          {/* Texto sobre la imagen */}
          <Typography
            variant="h3"
            sx={{
              position: "absolute",
              left: 20,
              bottom: 20,
              color: "white",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              zIndex: 1,
            }}
          >
            {coordinador?.nombres.split(" ")[0] || "No"}{" "}
            {coordinador?.apellidos.split(" ")[0] || "Especificado"}
          </Typography>
        </Box>
      </Grid>

      {/* Sección de acordeón */}
<Grid item xs={12} md={6}>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {/* Acordeón 1: Información Personal */}
    <Accordion
      sx={{
        width: "100%",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography variant="h6" component="span">
          Información Personal
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Cédula de Identidad:</strong> {coordinador?.cedula || "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Género:</strong> {coordinador?.genero || "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Fecha de Nacimiento:</strong>{" "}
            {coordinador?.fecha_nacimiento
              ? dayjs(coordinador.fecha_nacimiento).format("DD/MM/YYYY")
              : "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Email:</strong> {coordinador?.email || "No especificado"}
            <Tooltip title="Editar email" arrow>
              <IconButton size="small" sx={{ padding: "4px" }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Teléfono Celular:</strong> {coordinador?.telefono_movil || "No especificado"}
            <Tooltip title="Editar teléfono" arrow>
              <IconButton size="small" sx={{ padding: "4px" }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Dirección:</strong> {coordinador?.direccion || "No especificado"}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>

    {/* Acordeón 2: Información Coordinación */}
    <Accordion
      sx={{
        width: "100%",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
      >
        <Typography variant="h6" component="span">
          Información de Coordinación
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>PNF que coordina:</strong>{" "}
            {coordinador?.nombre_pnf
              ? `${coordinador.nombre_pnf} (${coordinador.codigo_pnf || "Sin código"})`
              : "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Estatus de Coordinador:</strong> {coordinador?.estatus_coordinador || "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Años de Experiencia:</strong> {coordinador?.anos_experiencia_coordinador || "No especificado"}
          </Typography>

          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <strong>Fecha de Designación:</strong>{" "}
            {coordinador?.fecha_designacion
              ? dayjs(coordinador.fecha_designacion).format("DD/MM/YYYY")
              : "No especificado"}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>

    {/* Acordeón 3: Información de Interés */}
    <Accordion
      sx={{
        width: "100%",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel4-content"
        id="panel4-header"
      >
        <Typography variant="h6" component="span">
          Información de Interés
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2">
            <strong>Dedicación:</strong> {coordinador?.dedicacion || "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Categoría:</strong> {coordinador?.categoria || "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Áreas de Conocimiento:</strong>{" "}
            {coordinador?.areas_de_conocimiento?.length
              ? coordinador.areas_de_conocimiento.join(", ")
              : "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Horas Disponibles:</strong>{" "}
            {coordinador?.horas_disponibles?.hours
              ? `${coordinador.horas_disponibles.hours} horas`
              : "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Disponibilidad:</strong>{" "}
            {coordinador?.disponibilidad?.length
              ? coordinador.disponibilidad
                  .map(
                    (d) => `${d.dia_semana}: ${d.hora_inicio} - ${d.hora_fin}`
                  )
                  .join(" | ")
              : "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Pregrado:</strong>{" "}
            {coordinador?.pre_grados?.length
              ? coordinador.pre_grados
                  .map((p) => `${p.completo}`)
                  .join(", ")
              : "No especificado"}
          </Typography>

          <Typography variant="body2">
            <strong>Postgrados:</strong>{" "}
            {coordinador?.pos_grados?.length
              ? coordinador.pos_grados
                  .map((p) => `${p.completo}`)
                  .join(", ")
              : "No posee"}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
</Grid>

    </Box>
  );
}
