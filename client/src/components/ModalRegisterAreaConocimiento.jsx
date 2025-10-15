import { Typography, Box, Modal, Fade, Backdrop } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import useApi from "../hook/useApi.jsx";
import CustomButton from "./customButton.jsx";
import CustomLabel from "./customLabel.jsx";

export default function ModalRegisterAreaConocimiento({ open, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const axios = useApi(true);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      area_conocimiento: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const payload = { area_conocimiento: data.area_conocimiento };

      await axios.post("/Profesor/areas-conocimiento", payload);

      reset();
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            Nueva Área de Conocimiento
          </Typography>

          <CustomLabel
            label="Nombre del Área de Conocimiento"
            name="area_conocimiento"
            required
            multiline
            rows={2}
            {...register("area_conocimiento", { required: true })}
          />

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <CustomButton onClick={onClose} tipo="secondary">
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
