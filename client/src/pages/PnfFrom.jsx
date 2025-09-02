import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography, Stack } from "@mui/material";
import CustomButton from "../components/customButton";
import CustomLabel from "../components/customLabel";
import ResponsiveAppBar from "../components/navbar";
import PNFSchema from "../schemas/PnfSchema";
import { registrarPnfApi } from "../apis/PNFApi";

export default function PnfForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(PNFSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registrarPnfApi({ data });
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
          Registrar PNF
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
            aria-labelledby="pnf-form-title"
          >
            <Stack spacing={5}>
              {/* Fila 1: Nombre y Código */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <CustomLabel
                  fullWidth
                  label="Nombre del PNF"
                  variant="outlined"
                  {...register("nombre_pnf")}
                  error={!!errors.nombre_pnf}
                  helperText={
                    errors.nombre_pnf?.message || "Colocar el nombre del PNF"
                  }
                  inputProps={{ "aria-required": "true" }}
                />

                <CustomLabel
                  fullWidth
                  label="Código"
                  variant="outlined"
                  {...register("codigoPNF")}
                  error={!!errors.codigoPNF}
                  helperText={
                    errors.codigoPNF?.message || "Código único del PNF"
                  }
                  inputProps={{ "aria-required": "true" }}
                />
              </Stack>

              {/* Fila 2: Población y Descripción */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <CustomLabel
                  fullWidth
                  label="Descripción (Opcional)"
                  variant="outlined"
                  multiline
                  rows={3}
                  {...register("descripcion")}
                />
              </Stack>

              {/* Botones */}
              <Stack direction="row" spacing={3} justifyContent="flex-end">
                <CustomButton
                  tipo="secondary"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Limpiar
                </CustomButton>

                <CustomButton
                  tipo="primary"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar PNF"}
                </CustomButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}
