import {
  Tooltip,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
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
import CustomChip from "./CustomChip.jsx";

export default function CardProfesor({ profesor, isSearch }) {
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
  const [isTitileando, setIsTitileando] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    console.log(profesorActual);
  }, [profesorActual]);

  // Efecto de titileo cuando isSearch es true
  useEffect(() => {
    if (isSearch) {
      setIsTitileando(true);
      const timer = setTimeout(() => {
        setIsTitileando(false);
      }, 5000); // Titileo durante 2 segundos

      return () => clearTimeout(timer);
    }
  }, [isSearch]);

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
    setOpenModalEditar(false);
  };

  // Guardar cambios en servidor
  const handleGuardarCambiosServidor = async () => {
    try {
      console.log(profesorActual);
      const respuesta = await axios.put(
        `/profesores/${profesorActual.cedula}`,
        profesorActual
      );
      console.log(respuesta);
      setProfesorEditado(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    }
  };

  // Eliminar profesor
  const handleProfesorEliminado = () => {
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
        boxShadow: isTitileando ? 6 : 2,
        overflow: "hidden",
        transform: isTitileando ? "scale(1.02)" : "scale(1)",
        border: isTitileando 
          ? `2px solid ${theme.palette.primary.main}`
          : "none",
        animation: isTitileando ? "titileo 0.5s ease-in-out infinite alternate" : "none",
        transition: "all 0.3s ease-in-out",
        "@keyframes titileo": {
          "0%": {
            boxShadow: `0 0 10px ${theme.palette.primary.main}`,
            transform: "scale(1.02)",
          },
          "100%": {
            boxShadow: `0 0 20px ${theme.palette.primary.main}, 0 0 30px ${theme.palette.primary.light}`,
            transform: "scale(1.03)",
          }
        }
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
            {/* Áreas de Conocimiento */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 120, fontWeight: "bold" }}
              >
                Áreas:
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                {profesorActual?.areas_de_conocimiento &&
                profesorActual.areas_de_conocimiento.length > 0 ? (
                  <>
                    {profesorActual.areas_de_conocimiento.map((area, index) => (
                      <CustomChip
                        key={area.id_area_conocimiento || index}
                        label={area.nombre_area_conocimiento}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No especificado
                  </Typography>
                )}
                <Tooltip title="Editar áreas" arrow>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleOpenModalEditar(
                        "areas_de_conocimiento",
                        profesorActual?.areas_de_conocimiento || []
                      )
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Pre-Grados */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 120, fontWeight: "bold" }}
              >
                Pre-Grados:
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                {profesorActual?.pre_grados &&
                profesorActual.pre_grados.length > 0 ? (
                  <>
                    {profesorActual.pre_grados.map((pregrado, index) => (
                      <CustomChip
                        key={pregrado.id_pre_grado || index}
                        label={`${pregrado.tipo_pre_grado} ${pregrado.nombre_pre_grado}`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No especificado
                  </Typography>
                )}
                <Tooltip title="Editar pre-grados" arrow>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleOpenModalEditar(
                        "pre_grados",
                        profesorActual?.pre_grados || []
                      )
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Pos-Grados */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 120, fontWeight: "bold" }}
              >
                Pos-Grados:
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                {profesorActual?.pos_grados &&
                profesorActual.pos_grados.length > 0 ? (
                  <>
                    {profesorActual.pos_grados.map((posgrado, index) => (
                      <CustomChip
                        key={posgrado.id_pos_grado || index}
                        label={`${posgrado.tipo_pos_grado} ${posgrado.nombre_pos_grado}`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No especificado
                  </Typography>
                )}
                <Tooltip title="Editar pos-grados" arrow>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleOpenModalEditar(
                        "pos_grados",
                        profesorActual?.pos_grados || []
                      )
                    }
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
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
    </Box>
  );
}