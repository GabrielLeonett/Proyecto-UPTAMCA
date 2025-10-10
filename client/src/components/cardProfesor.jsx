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
import { useState, useEffect } from "react";
import axios from "../apis/axios.js";

export default function CardProfesor({ profesor }) {
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Cargar la imagen del profesor
  // Cargar la imagen del profesor
  useEffect(() => {
    const loadProfessorImage = async () => {
      if (!profesor?.cedula) {
        console.log("❌ No hay cédula del profesor");
        setImageLoading(false);
        setImageError(true);
        return;
      }

      try {
        console.log(
          "🔄 Iniciando carga de imagen para cédula:",
          profesor.cedula
        );
        setImageLoading(true);
        setImageError(false);

        const response = await axios.get(
          `http://localhost:3000/profesor/img/${profesor.cedula}`,
          {
            responseType: "blob", // ¡IMPORTANTE! Agrega esto
          }
        );

        console.log("✅ Respuesta recibida:", {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          dataType: typeof response.data,
          dataSize: response.data.size,
        });

        if (response.status === 200 && response.data.size > 0) {
          // Crear URL para la imagen blob
          const imageUrl = URL.createObjectURL(response.data);
          console.log("📷 URL creada:", imageUrl);
          setAvatarUrl(imageUrl);
        } else {
          console.log("❌ Respuesta vacía o inválida");
          throw new Error("Imagen no encontrada o vacía");
        }
      } catch (error) {
        console.error("❌ Error cargando imagen del profesor:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadProfessorImage();
  }, [profesor?.cedula]);

  // Limpiar la URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
  });

  // URL de fallback para el avatar
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${
    profesor?.nombres || "Profesor"
  }+${profesor?.apellidos || ""}&background=random&size=256`;

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        padding: "30px",
        borderRadius: "25px",
        alignItems: "flex-start",
        width: { xs: "100%", sm: 500, md: 600 },
        minWidth: 300,
        maxWidth: 500,
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
            src={imageError || !avatarUrl ? fallbackAvatarUrl : avatarUrl}
            alt={`${profesor?.nombres} ${profesor?.apellidos}`}
            sx={{
              width: "100%",
              height: 500,
              minHeight: 200,
              backgroundColor: theme.palette.grey[300],
              transition: "all 0.3s ease",
              filter: imageLoading ? "blur(5px)" : "none",
            }}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />

          {/* Overlay de carga */}
          {imageLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cargando imagen...
              </Typography>
            </Box>
          )}

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
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {profesor?.nombres?.split(" ")[0] || "No"}{" "}
            {profesor?.apellidos?.split(" ")[0] || "Especificado"}
          </Typography>
        </Box>
      </Grid>

      {/* Sección de acordeón */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
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
                  {profesor?.cedula || "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Género:</strong>{" "}
                  {profesor?.genero || "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {profesor?.fecha_nacimiento
                    ? dayjs(profesor.fecha_nacimiento).format("DD/MM/YYYY")
                    : "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Email:</strong> {profesor?.email || "No especificado"}
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
                  {profesor?.telefono_movil || "No especificado"}
                  <Tooltip title="Editar teléfono" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Acordeón 2: Información Educativa */}
          <Accordion
            sx={{
              width: "100%",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography variant="h6" component="span">
                Información Educativa
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Áreas de Conocimiento:</strong>{" "}
                  {profesor?.areas_de_conocimiento || "No especificado"}
                  <Tooltip title="Editar áreas de conocimiento" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Pre-Grado:</strong>{" "}
                  {profesor?.pre_grados || "No especificado"}
                  <Tooltip title="Editar pre-grado" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Pos-Grado:</strong>{" "}
                  {profesor?.pos_grados || "No especificado"}
                  <Tooltip title="Editar pos-grado" arrow>
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
                  {profesor?.fecha_ingreso
                    ? dayjs(profesor.fecha_ingreso).format("DD/MM/YYYY")
                    : "No especificado"}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <strong>Categoría:</strong>{" "}
                  {profesor?.categoria || "No especificado"}
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
                  {profesor?.dedicacion || "No especificado"}
                  <Tooltip title="Editar dedicación" arrow>
                    <IconButton size="small" sx={{ padding: "4px" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Typography variant="body2">
                  <strong>Disponibilidad:</strong>{" "}
                  {profesor?.horas_disponibles
                    ? `${profesor?.horas_disponibles?.hours || 0} horas ${
                        profesor?.horas_disponibles?.minutes || 0
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
                profesor...
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Grid>
    </Box>
  );
}
