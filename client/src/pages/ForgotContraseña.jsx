import { useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ResponsiveAppBar from "../components/navbar";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material";
import useApi from "../hook/useApi";
import useSweetAlert from "../hook/useSweetAlert";

export default function ForgotContraseña() {
  const theme = useTheme();
  const axios = useApi();
  const alert = useSweetAlert();

  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await axios.post("/auth/forgot-password", { email });

      alert.success(
        "Correo enviado",
        "Si existe una cuenta asociada, se enviaron instrucciones a tu correo."
      );
    } catch (error) {
      // El backend debe devolver mensaje genérico siempre.
      alert.info(
        "Correo enviado",
        "Si existe una cuenta asociada, se enviaron instrucciones a tu correo."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box className="my-10 flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl p-12 shadow-2xl sm:w-full md:w-140"
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
            Olvidé mi Contraseña
          </Typography>

          <Typography
            variant="body1"
            className="text-center"
            sx={{ color: theme.palette.text.secondary, marginBottom: 3 }}
          >
            Ingresa tu correo institucional para enviarte el enlace de recuperación.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <CustomLabel
              fullWidth
              id="email"
              label="Correo Institucional"
              type="email"
              value={email}
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Ejemplo: nombre.apellido@uptamca.edu"
            />
          </Box>

          <CustomButton
            type="submit"
            variant="contained"
            className="h-12 rounded-xl font-medium"
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Enviar instrucciones"
            )}
          </CustomButton>

          <Typography
            variant="caption"
            className="text-center"
            sx={{
              color: theme.palette.text.disabled,
              marginTop: 2,
              display: "block",
            }}
          >
            Recibirás un enlace para restablecer tu contraseña.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
