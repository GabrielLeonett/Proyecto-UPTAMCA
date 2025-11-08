import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ContraseñaSchema from "../schemas/contrasenia.schema";
import CustomLabel from "../components/customLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ResponsiveAppBar from "../components/navbar";
import CircularProgress from "@mui/material/CircularProgress";
import CustomButton from "../components/customButton";
import { useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useApi from "../hook/useApi";
import useSweetAlert from "../hook/useSweetAlert";

export default function RestablecerContraseña() {
  const axios = useApi();
  const theme = useTheme();
  const alert = useSweetAlert();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const [params] = useSearchParams();
  const token = params.get("token");
  const uid = params.get("uid");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    resolver: zodResolver(ContraseñaSchema),
    mode: "onChange",
    shouldFocusError: true,
  });

  const onSubmit = async (formData) => {
    try {
      setProcessing(true);
      const payload = {
        token,
        uid,
        password: formData.password,
        repetir_password: formData.repetir_password,
      };

      const res = await axios.post("/auth/reset-password", payload);

      if (res.status === 200) {
        alert.success(
          "Contraseña restablecida",
          "Tu contraseña ha sido cambiada exitosamente"
        );
        navigate("/");
      }
    } catch (error) {
      alert.error(
        "Error al restablecer",
        "El enlace es inválido o ha expirado. Solicita un nuevo reinicio."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box className="my-10 flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-around gap-6 rounded-2xl p-12 shadow-2xl sm:w-full md:w-140"
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            className="text-center font-bold"
            sx={{ fontWeight: 600, color: theme.palette.primary.main }}
          >
            Restablecer Contraseña
          </Typography>

          <Typography
            variant="body1"
            className="text-center"
            sx={{ color: theme.palette.text.secondary, marginBottom: 3 }}
          >
            Ingresa tu nueva contraseña
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <CustomLabel
              fullWidth
              id="password"
              label="Nueva Contraseña"
              type="password"
              variant="outlined"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message || "Mínimo 8 caracteres alfanuméricos"}
            />

            <CustomLabel
              fullWidth
              id="repetir_password"
              label="Repetir Contraseña"
              type="password"
              variant="outlined"
              {...register("repetir_password")}
              error={!!errors.repetir_password}
              helperText={errors.repetir_password?.message || "Confirma tu nueva contraseña"}
            />
          </Box>

          {errors.root && (
            <Typography color="error" className="mb-4 text-center">
              {errors.root.message}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              marginTop: 2,
            }}
          >
            <CustomButton
              type="button"
              variant="outlined"
              className="h-12 flex-1 rounded-xl font-medium"
              onClick={handleCancelar}
              disabled={processing}
              tipo="secondary"
            >
              Cancelar
            </CustomButton>

            <CustomButton
              type="submit"
              variant="contained"
              className="h-12 flex-1 rounded-xl font-medium"
              disabled={processing || !isValid}
              onClick={async () => {
                await trigger();
              }}
            >
              {processing ? <CircularProgress size={24} color="inherit" /> : "Restablecer"}
            </CustomButton>
          </Box>

          <Typography
            variant="caption"
            className="text-center"
            sx={{
              color: theme.palette.text.disabled,
              marginTop: 2,
              display: "block",
            }}
          >
            La contraseña debe contener letras, números y tener al menos 8 caracteres.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
