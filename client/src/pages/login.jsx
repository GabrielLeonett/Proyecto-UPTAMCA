import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/LoginSchema";
import CustomLabel from "../components/customLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ResponsiveAppBar from "../components/navbar";
import CircularProgress from "@mui/material/CircularProgress";
import CustomButton from "../components/customButton";
import { useState } from "react";
import { useAuth } from "../hook/useAuth";

export default function Login() {
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    trigger,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    shouldFocusError: true,
  });

  const { login } = useAuth();

  const onSubmit = async (formData) => {
    console.log('se esta ejecutando esta mierda no se porque')
    
    // Forzar validación antes de enviar
    const isValid = await trigger();
    if (!isValid) {
      console.log("El formulario no es válido, no se envía");
      return;
    }
    
    setProcessing(true);
    try {
      login(formData);
    } catch (error) {
      console.error("Error en el login:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Credenciales incorrectas",
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <>
      <ResponsiveAppBar
        pages={["Universidad", "Academico", "Servicios", "Tramites"]}
        backgroundColor
      />

      <Box className="my-10 flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-around gap-4 rounded-2xl bg-white p-20 shadow-2xl sm:w-full md:w-140"
          autoComplete="off"
        >
          <Typography
            variant="h5"
            component="h1"
            className="my-10 text-center font-bold text-gray-800"
            sx={{ fontWeight: 600 }}
          >
            Inicio de sesión
          </Typography>

          <Box className="mb-5 w-full">
            <CustomLabel
              fullWidth
              id="email"
              label="Email"
              type="email"
              variant="outlined"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message || "Ej: usuario@dominio.com"}
              className="mb-1"
            />
          </Box>

          <Box className="mb-6 w-full">
            <CustomLabel
              fullWidth
              id="password"
              label="Contraseña"
              type="password"
              variant="outlined"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message || "Mínimo 8 caracteres"}
              className="mb-1"
            />
          </Box>

          {errors.root && (
            <Typography color="error" className="mb-4 text-center">
              {errors.root.message}
            </Typography>
          )}

          <CustomButton
            type="submit"
            variant="contained"
            className="h-15 w-full rounded-xl py-3 font-medium"
            disabled={processing || !isValid}
            onClick={async () => {
              await trigger(); // Forzar validación
            }}
          >
            {processing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Ingresar"
            )}
          </CustomButton>

          <Typography
            variant="body2"
            className="mt-6 text-center text-gray-600"
          >
            <a href="/support" className="hover:underline">
              ¿Problemas para acceder? Contacta al soporte
            </a>
          </Typography>
        </Box>
      </Box>
    </>
  );
}
