import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, Stack } from "@mui/material";
import CustomButton from "../../components/customButton";
import CustomLabel from "../../components/customLabel";
import ResponsiveAppBar from "../../components/navbar";
import UnidadCurricularSchema from "../../schemas/unidadcurricular.schema";
import useApi from "../../hook/useApi";
import { useLocation } from "react-router-dom";

export default function RegistrarUnidadCurricular() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { idTrayecto } = location.state;
  const axios = useApi(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(UnidadCurricularSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.post(`/trayectos/${idTrayecto}/unidades-curriculares`, data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: 4, pb: 10 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ mt: 6, ml: 6 }}
        >
          Registrar Unidad Curricular
        </Typography>

        <Box
          sx={{
            maxWidth: 1000,
            mx: "auto",
            p: 5,
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            aria-labelledby="unidad-curricular-form-title"
          >
            <Stack spacing={5}>
              {/* Fila 1: Nombre y Código */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <CustomLabel
                  fullWidth
                  label="Nombre de la Unidad Curricular"
                  variant="outlined"
                  {...register("nombre_unidad_curricular")}
                  error={!!errors.nombre_unidad_curricular}
                  helperText={
                    errors.nombre_unidad_curricular?.message ||
                    "Ingrese el nombre de la unidad curricular"
                  }
                  inputProps={{ "aria-required": "true" }}
                />

                <CustomLabel
                  fullWidth
                  label="Código de la Unidad Curricular"
                  variant="outlined"
                  {...register("codigo_unidad_curricular")}
                  error={!!errors.codigo_unidad_curricular}
                  helperText={
                    errors.codigo_unidad_curricular?.message ||
                    "Código único de la unidad curricular"
                  }
                  inputProps={{ "aria-required": "true" }}
                />
              </Stack>

              {/* Fila 2: Descripción y Carga Horaria */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <CustomLabel
                  fullWidth
                  label="Descripción de la Unidad Curricular"
                  variant="outlined"
                  multiline
                  rows={3}
                  {...register("descripcion_unidad_curricular")}
                  error={!!errors.descripcion_unidad_curricular}
                  helperText={errors.descripcion_unidad_curricular?.message}
                />

                <CustomLabel
                  fullWidth
                  label="Carga Horas Académicas"
                  variant="outlined"
                  type="number"
                  {...register("carga_horas_academicas", {
                    valueAsNumber: true,
                    required: "Este campo es requerido",
                    min: {
                      value: 0,
                      message: "La carga horaria no puede ser negativa",
                    },
                  })}
                  error={!!errors.carga_horas_academicas}
                  helperText={errors.carga_horas_academicas?.message}
                  inputProps={{
                    "aria-required": "true",
                  }}
                />
              </Stack>

              {/* Fila 3: Botones */}
              <Stack direction="row" spacing={3} justifyContent="flex-end">
                <CustomButton
                  tipo="secondary"
                  onClick={() => {
                    console.log("🔄 Reseteando formulario");
                    reset();
                  }}
                  disabled={isSubmitting}
                >
                  Limpiar
                </CustomButton>

                <CustomButton
                  tipo="primary"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Unidad Curricular"}
                </CustomButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}
