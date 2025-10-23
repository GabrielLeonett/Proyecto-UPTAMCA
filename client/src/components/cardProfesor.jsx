import {
  Grid,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
import ModalEliminarProfe from "../components/ModalEliminarProfe.jsx";

export default function CardProfesor({ profesor }) {
  const axios = useApi(false);
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // Cargar imagen
  useEffect(() => {
    if (hasFetched.current || !profesor?.cedula) return;
    const loadProfessorImage = async () => {
      hasFetched.current = true;
      try {
        const response = await axios.get(
          `/profesores/${profesor.cedula}/imagen`,
          { responseType: "blob" }
        );
        console.log(response.data)
        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error("Error cargando imagen:", error);
      }
    };
    loadProfessorImage();
  }, [profesor?.cedula, axios]);

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Modal eliminar
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Cuando se elimina correctamente → redirige a Profesores Eliminados
  const handleProfesorEliminado = () => {
    setMensaje("Profesor eliminado correctamente");
    setTimeout(() => {
      navigate("/profesores/eliminados");
    }, 1200);
  };

  // Iniciales del avatar
  const getInitials = () => {
    const firstname = profesor?.nombres?.charAt(0) || "N";
    const lastname = profesor?.apellidos?.charAt(0) || "E";
    return `${firstname}${lastname}`;
  };

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderRadius: "15px",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
        boxShadow: 2,
        overflow: "hidden",
      }}
    >
      {/* Imagen */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "300px",
        }}
      >
        <Avatar
          variant="square"
          src={avatarUrl || undefined}
          alt={`${profesor?.nombres} ${profesor?.apellidos}`}
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: avatarUrl
              ? theme.palette.grey[300]
              : theme.palette.primary.main,
            fontSize: "3rem",
            color: "white",
          }}
          onError={(e) => {
            console.log("Error cargando imagen, mostrando iniciales");
            setAvatarUrl(null);
            e.target.style.display = "none";
          }}
        >
          {!avatarUrl && getInitials()}
        </Avatar>

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          }}
        />
        <Typography
          variant="h5"
          sx={{
            position: "absolute",
            left: 15,
            bottom: 15,
            color: "white",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            zIndex: 1,
          }}
        >
          {profesor?.nombres?.split(" ")[0] || "No"}{" "}
          {profesor?.apellidos?.split(" ")[0] || "Especificado"}
        </Typography>
      </Box>

      {/* Contenido */}
      <Box
        sx={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Acordeones */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Accordion sx={{ "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Información Personal</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                <strong>Cédula:</strong> {profesor?.cedula || "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Género:</strong> {profesor?.genero || "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha Nac.:</strong>{" "}
                {profesor?.fecha_nacimiento
                  ? dayjs(profesor.fecha_nacimiento).format("DD/MM/YYYY")
                  : "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {profesor?.email || "No especificado"}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Información Educativa</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                <strong>Áreas:</strong>{" "}
                {profesor?.areas_de_conocimiento || "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Pre-Grado:</strong>{" "}
                {profesor?.pre_grados || "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Pos-Grado:</strong>{" "}
                {profesor?.pos_grados || "No especificado"}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                Información Profesional
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                <strong>Fecha Ingreso:</strong>{" "}
                {profesor?.fecha_ingreso
                  ? dayjs(profesor.fecha_ingreso).format("DD/MM/YYYY")
                  : "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Categoría:</strong>{" "}
                {profesor?.categoria || "No especificado"}
              </Typography>
              <Typography variant="body2">
                <strong>Dedicación:</strong>{" "}
                {profesor?.dedicacion || "No especificado"}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Eliminar profesor */}
          <Accordion sx={{ "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" color="error">
                Eliminar Profesor
              </Typography>
            </AccordionSummary>
            <AccordionActions>
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenModal}
                fullWidth
                size="small"
              >
                Eliminar
              </Button>
            </AccordionActions>
          </Accordion>
        </Box>
      </Box>

      {/* Modal eliminar */}
      <ModalEliminarProfe
        profesor={profesor}
        open={openModal}
        onClose={handleCloseModal}
        onEliminado={handleProfesorEliminado} // 🔹 Nuevo callback
      />

      {/* Snackbar */}
      <Snackbar
        open={!!mensaje}
        autoHideDuration={2000}
        onClose={() => setMensaje(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}
