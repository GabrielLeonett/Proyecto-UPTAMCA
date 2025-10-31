import {
  Typography,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
import CustomButton from "./customButton";
import ModalEditarCampoPNF from "./ModalEditarCampoPNF";

export default function CardPNF({ PNF, onActualizar }) {
  const theme = useTheme();
  const axios = useApi(false);
  const navigate = useNavigate();

  // Estados
  const [pnfActual, setPnfActual] = useState(PNF);
  const [pnfEditado, setPnfEditado] = useState(false);
  const [openModalEditar, setOpenModalEditar] = useState(false);
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState("");
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    console.log(PNF);
    setPnfActual(PNF);
  }, [PNF]);

  // Abrir modal de edición
  const handleOpenModalEditar = (campo, valorActual) => {
    setCampoEditando(campo);
    setValorEditando(valorActual || "");
    setOpenModalEditar(true);
  };

  // Guardar el campo en memoria
  const handleGuardarCampo = (campo, nuevoValor) => {
    const actualizado = { ...pnfActual, [campo]: nuevoValor };
    setPnfActual(actualizado);
    setPnfEditado(true);
    setMensaje(`Campo "${campo}" actualizado localmente`);
    setOpenModalEditar(false);
  };

  // Guardar los cambios en el servidor
  const handleGuardarCambiosServidor = async () => {
    try {
      console.log(pnfEditado, pnfActual);
      await axios.put(`/pnf/${pnfActual.id_pnf}`, pnfActual);
      setPnfEditado(false);
      setMensaje("Cambios guardados correctamente");

      if (onActualizar) onActualizar();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMensaje("Error al guardar los cambios");
    }
  };

  return (
    <Box
      component="div"
      id={pnfActual.codigo}
      sx={{
        maxWidth: "1100px",
        width: "100%",
        mx: "auto",
        mt: 5,
        p: 3,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 6,
          transform: "scale(1.01)",
        },
      }}
    >
      {/* Título principal y botón de ver */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          component="h2"
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
          }}
        >
          {pnfActual?.nombre_pnf || "PNF sin nombre"}
        </Typography>

        <Tooltip title="Ver detalles del PNF" arrow>
          <IconButton
            color="primary"
            onClick={() =>
              navigate(`/formacion/programas/${pnfActual.codigo_pnf}`, {
                state: { PNF: pnfActual.codigo_pnf },
              })
            }
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Información general */}
      <Box sx={{ mt: 1 }}>
        <Typography sx={{ display: "flex", alignItems: "center" }}>
          <strong>Código:</strong>&nbsp;
          {pnfActual?.codigo_pnf || "No definido"}
        </Typography>

        <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <strong>Población Estudiantil:</strong>&nbsp;
          {pnfActual?.poblacion_estudiantil || "0"}
        </Typography>

        <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <strong>Descripción:</strong>&nbsp;
          {pnfActual?.descripcion_pnf || "Sin descripción"}
          <Tooltip title="Editar descripción del PNF" arrow>
            <IconButton
              size="small"
              sx={{ ml: 1 }}
              onClick={() =>
                handleOpenModalEditar(
                  "descripcion_pnf",
                  pnfActual.descripcion_pnf
                )
              }
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>

        <Typography sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <strong>Duración Trayectos:</strong>&nbsp;
          {pnfActual?.duracion_trayectos || 2}
          <Tooltip title="Editar duración de trayectos" arrow>
            <IconButton
              size="small"
              sx={{ ml: 1 }}
              onClick={() =>
                handleOpenModalEditar(
                  "duracion_trayectos",
                  pnfActual.duracion_trayectos
                )
              }
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>

        {/* Botón para guardar cambios */}
        {pnfEditado && (
          <CustomButton
            tipo="success"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleGuardarCambiosServidor}
          >
            Guardar Cambios
          </CustomButton>
        )}
      </Box>

      {/* Modal para editar campos */}
      <ModalEditarCampoPNF
        open={openModalEditar}
        onClose={() => setOpenModalEditar(false)}
        campo={campoEditando}
        valorActual={valorEditando}
        onGuardar={handleGuardarCampo}
      />

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={!!mensaje}
        autoHideDuration={2500}
        onClose={() => setMensaje(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={
            mensaje?.toLowerCase().includes("error") ? "error" : "success"
          }
          variant="filled"
          sx={{ width: "100%" }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}
