import {
  Typography,
  Box,
  Modal,
  Fade,
  Backdrop,
  MenuItem, // ✅ asegurado aquí
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import useApi from "../hook/useApi.jsx";
import CustomButton from "./customButton.jsx";
import CustomLabel from "./customLabel.jsx";
import Swal from "sweetalert2";

const TIPOS_POSGRADO = [
  'Especialización', 'Maestría', 'Doctorado', 'Diplomado', 
  'Posdoctorado', 'Certificación', 'Curso Avanzado', 
  'Residencia Médica', 'Fellowship'
];

export default function ModalRegisterPosgrado({ open, onClose, setState }) {
  const [isLoading, setIsLoading] = useState(false);
  const axios = useApi();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      tipo: "",
      nombre: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        tipo: data.tipo,
        nombre: data.nombre,
      };

      await axios.post("/Profesor/pos-grado", payload);

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "El posgrado fue registrado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Actualizar lista de posgrados
      const res = await axios.get("/Profesor/pos-grado");
      setState(res.data.data.data || res.data.data);

      reset();
      onClose();
    } catch (error) {
      console.error("Error al registrar posgrado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar el posgrado. Intenta nuevamente.",
      });
    } finally {
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
            Nuevo Posgrado
          </Typography>

          <CustomLabel
            select
            label="Tipo de Posgrado"
            required
            {...register("tipo", { required: true })}
          >
            <MenuItem value="">Seleccione un tipo</MenuItem>
            {TIPOS_POSGRADO.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </CustomLabel>

          <CustomLabel
            label="Nombre del Posgrado"
            name="nombre"
            required
            multiline
            rows={2}
            {...register("nombre", { required: true })}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
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
