import {
  Typography,
  Box,
  Modal,
  Fade,
  Backdrop,
  MenuItem,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import useApi from "../hook/useApi.jsx";
import CustomButton from "./customButton.jsx";

export default function ModalRegisterPreGrado({ open, onClose, setState }) {
  const [isLoading, setIsLoading] = useState(false);
  const axios  = useApi(true);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      tipo: "",
      nombre: "",
    },
  });


  const tiposPregrado = [
    "Técnico Superior",
    "Licenciatura",
    "Ingeniería",
    "Medicina",
    "Arquitectura",
    "Derecho",
    "Educación",
    "Administración",
    "Contaduría",
    "Comunicación",
    "Psicología",
    "Enfermería",
    "Nutrición",
    "Turismo",
    "Idiomas",
  ];

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const payload = {
        tipo: data.tipo,
        nombre: data.nombre,
      };

      await axios.post("/catalogos/pregrados", payload);

      // Actualizar lista
      const res = await axios.get("/catalogos/pregrados");
      setState(res); // ✅ Asegúrate de usar res.data

      reset();
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    reset(); // ✅ Resetear form al cerrar
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose} // ✅ Usar handleClose
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            width: 480,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Nuevo Pregrado
          </Typography>

          {/* Campo tipo - SOLUCIÓN */}
          <Box>
            <TextField
              select
              label="Tipo de Pregrado"
              required
              id="tipo"
              fullWidth
              {...register("tipo", { required: true })}
              value={watch("tipo") || ""} // ✅ Esto asegura que nunca sea undefined
            >
              <MenuItem value="">Seleccione un tipo</MenuItem>
              {tiposPregrado.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Campo nombre */}
          <Box>
            <TextField
              label="Nombre del Pregrado"
              id="nombre"
              required
              multiline
              rows={2}
              fullWidth
              {...register("nombre", { required: true })}
            />
          </Box>

          {/* Botones */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <CustomButton onClick={handleClose} tipo="secondary">
              Cancelar
            </CustomButton>
            <CustomButton tipo="primary" disabled={isLoading} type="submit">
              {isLoading ? "Guardando..." : "Guardar"}
            </CustomButton>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}