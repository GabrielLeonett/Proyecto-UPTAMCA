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
import { ProfesorSchema } from "../schemas/ProfesorSchema.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function CardCoordinador({ coordinador }) {
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
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
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Cédula de Identidad:</strong>{" "}
                  {coordinador?.cedula || "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Género:</strong>{" "}
                  {coordinador?.genero || "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {coordinador?.fecha_nacimiento
                    ? dayjs(coordinador.fecha_nacimiento).format("DD/MM/YYYY")
                    : "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Email:</strong>{" "}
                  {coordinador?.email || "No especificado"}
                  <Tooltip title="Editar email" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Teléfono Celular:</strong>{" "}
                  {coordinador?.telefono_movil || "No especificado"}
                  <Tooltip title="Editar teléfono" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Acordeón 3: Información Profesional */}
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
                Información Profesional
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Fecha Ingreso:</strong>{" "}
                  {coordinador?.fecha_ingreso
                    ? dayjs(coordinador.fecha_ingreso).format("DD/MM/YYYY")
                    : "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Categoría:</strong>{" "}
                  {coordinador?.categoria || "No especificado"}
                  <Tooltip title="Editar categoría" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Dedicación:</strong>{" "}
                  {coordinador?.dedicacion || "No especificado"}
                  <Tooltip title="Editar dedicación" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography variant="body2">
                  <strong>Disponibilidad:</strong>{" "}
                  {coordinador?.horas_disponibles
                    ? `${coordinador?.horas_disponibles?.hours || 0} horas ${
                        coordinador?.horas_disponibles?.minutes || 0
                      } minutos`
                    : "No especificado"}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Acordeón 4: Disponibilidad Horaria */}
          <Accordion
            sx={{
              width: "100%",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel5-content"
              id="panel5-header"
            >
              <Typography variant="h6" component="span">
                Disponibilidad Horaria
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                Detalles específicos sobre la disponibilidad horaria del
                coordinador...
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Grid>
    </Box>
  );
}
