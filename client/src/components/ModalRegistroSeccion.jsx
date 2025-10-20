import {
  Box,
  Modal,
  Fade,
  Backdrop,
  Typography,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import CustomButton from "./customButton";
import useApi from "../hook/useApi";

export default function ModalRegistroSeccion({
  open,
  handleClose,
  idTrayecto,
}) {
  const { register, handleSubmit, reset } = useForm();
  const axios = useApi(true);

  const onSubmit = async (data) => {
    try {
      await axios.post(`/trayectos/${idTrayecto}/secciones`, {
        poblacionEstudiantil: parseInt(data.poblacion_estudiantil),
      });
    } finally {
      reset();
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            width: 400,
          }}
        >
          <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
            Registrar Nueva Sección
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Población Estudiantil"
              type="number"
              {...register("poblacion_estudiantil", { required: true })}
              sx={{ mb: 3 }}
            />

            <Box display="flex" justifyContent="center" gap={2}>
              <CustomButton tipo="secondary" onClick={handleClose}>
                Cancelar
              </CustomButton>
              <CustomButton tipo="primary" type="submit">
                Registrar
              </CustomButton>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
