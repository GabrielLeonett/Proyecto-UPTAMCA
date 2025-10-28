import {
  Tooltip,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
import ModalEliminarProfe from "../components/ModalEliminarProfe.jsx";
import ModalEditarCampoProfesor from "../components/ModalEditarCampoProfesor.jsx";
import CustomButton from "./customButton.jsx";

export default function CardProfesor({ profesor }) {
  const axios = useApi(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const [profesorActual, setProfesorActual] = useState(profesor);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [openModalEliminar, setOpenModalEliminar] = useState(false);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState("");
  const [profesorEditado, setProfesorEditado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    console.log(profesorActual);
  }, []);

  // Cargar imagen del profesor
  useEffect(() => {
    if (hasFetched.current || !profesor?.cedula) return;
    const loadProfessorImage = async () => {
      hasFetched.current = true;
      try {
        const response = await axios.get(
          `/profesores/${profesor.cedula}/imagen`,
          { responseType: "blob" }
        );
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

  // Abrir modal de edición
  const handleOpenModalEditar = (campo, valorActual) => {
    setCampoEditando(campo);
    setValorEditando(valorActual || "");
    setOpenModalEditar(true);
  };

  // Guardar el campo editado
  const handleGuardarCampo = (campo, nuevoValor) => {
    const actualizado = { ...profesorActual, [campo]: nuevoValor };
    setProfesorActual(actualizado);
    setProfesorEditado(true);
    setMensaje(`Campo "${campo}" actualizado correctamente`);
    setOpenModalEditar(false); // ✅ cerrar el modal después de guardar
  };

  // Guardar cambios en servidor
  const handleGuardarCambiosServidor = async () => {
    try {
      await axios.put(
        `/profesores/${profesorActual.id_profesor}`,
        profesorActual
      );
      setProfesorEditado(false);
      setMensaje("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMensaje("Error al guardar cambios");
    }
  };

  // Eliminar profesor
  const handleProfesorEliminado = () => {
    setMensaje("Profesor eliminado correctamente");
    setTimeout(() => {
      navigate("/profesores/eliminados");
    }, 1200);
  };

  // Iniciales del profesor
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
      {/* Imagen del profesor */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "300px",
          overflow: "hidden",
        }}
      >
        <Avatar
          variant="square"
          src={avatarUrl || undefined}
          alt={`${profesorActual?.nombres} ${profesorActual?.apellidos}`}
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
              "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)",
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
          }}
        >
          {profesorActual?.nombres?.split(" ")[0] || "No"}{" "}
          {profesorActual?.apellidos?.split(" ")[0] || "Especificado"}
        </Typography>
      </Box>

      {/* Información */}
      <Box
        sx={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Información Personal */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Información Personal</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>Cédula:</strong>{" "}
              {profesorActual?.cedula || "No especificado"}
            </Typography>
            <Typography>
              <strong>Género:</strong>{" "}
              {profesorActual?.genero || "No especificado"}
            </Typography>
            <Typography>
              <strong>Fecha Nac.:</strong>{" "}
              {profesor?.fecha_nacimiento
                ? dayjs(profesor.fecha_nacimiento).format("DD/MM/YYYY")
                : "No especificado"}
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Email:</strong>{" "}
              {profesorActual?.email || "No especificado"}
              <Tooltip title="Editar email" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar("email", profesorActual.email)
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Información Educativa */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Información Educativa</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Áreas:</strong>{" "}
              {profesorActual?.areas_de_conocimiento || "No especificado"}
              <Tooltip title="Editar áreas" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar(
                      "areas_de_conocimiento",
                      profesorActual.areas_de_conocimiento
                    )
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Pre-Grados:</strong>{" "}
              {profesorActual?.pre_grados || "No especificado"}
              <Tooltip title="Editar pregrado" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar(
                      "pre_grados",
                      profesorActual.pre_grados
                    )
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Pos-Grados:</strong>{" "}
              {profesorActual?.pos_grados || "No especificado"}
              <Tooltip title="Editar pregrado" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar(
                      "pos_grados",
                      profesorActual.pos_grados
                    )
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Información Profesional */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Información Profesional</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Categoría:</strong>{" "}
              {profesorActual?.categoria || "No especificado"}
              <Tooltip title="Editar categoría" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar("categoria", profesorActual.categoria)
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center" }}>
              <strong>Dedicación:</strong>{" "}
              {profesorActual?.dedicacion || "No especificado"}
              <Tooltip title="Editar dedicación" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    handleOpenModalEditar(
                      "dedicacion",
                      profesorActual.dedicacion
                    )
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Acciones */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" color="primary">
              Acciones Profesor
            </Typography>
          </AccordionSummary>
          <AccordionActions>
            <CustomButton
              tipo="error"
              onClick={() => setOpenModalEliminar(true)}
              fullWidth
            >
              Eliminar
            </CustomButton>
            <CustomButton
              variant="contained"
              fullWidth
              onClick={() =>
                navigate("/academico/profesores/disponibilidad", {
                  state: { idProfesor: profesorActual.id_profesor },
                })
              }
            >
              Disponibilidad
            </CustomButton>
          </AccordionActions>
        </Accordion>

        {profesorEditado && (
          <CustomButton
            tipo="success"
            variant="contained"
            onClick={handleGuardarCambiosServidor}
          >
            Guardar Cambios
          </CustomButton>
        )}
      </Box>

      {/* ✅ Modal editar campo */}
      <ModalEditarCampoProfesor
        open={openModalEditar}
        onClose={() => setOpenModalEditar(false)}
        campo={campoEditando}
        valorActual={valorEditando}
        onGuardar={handleGuardarCampo}
      />

      {/* Modal eliminar */}
      <ModalEliminarProfe
        profesor={profesorActual}
        open={openModalEliminar}
        onClose={() => setOpenModalEliminar(false)}
        onEliminado={handleProfesorEliminado}
      />

      {/* Snackbar */}
      <Snackbar
        open={!!mensaje}
        autoHideDuration={2500}
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
