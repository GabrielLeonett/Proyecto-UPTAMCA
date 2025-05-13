import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CustomButton from "../components/customButton";
import Swal from "sweetalert2";
import ResponsiveAppBar from "../components/navbar";
import { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useEffect } from "react";
import {useNavigate} from "react-router-dom"

export default function Login() {
  const navigate = useNavigate();

  const { login, isAutenticate } = useAuth();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(()=>{
    if (isAutenticate) {
      navigate('/Profesores')
    }
  }, [isAutenticate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      const datos = await login(data);
      setProcessing(false);
      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        showConfirmButton: false,
      });
    } catch (error) {
      setProcessing(false);
      Swal.fire({
        icon: "error",
        title: "Inicio de sesión fallido",
        showConfirmButton: false,
        text: error,
      });
      setErrors((prev) => ({
        ...prev,
        email: "Correo o contraseña incorrectos",
      }));
    }
    
  }

  return (
    <>
      <ResponsiveAppBar
        pages={["Universidad", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />

      <Box className="my-10 flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="flex flex-col justify-around gap-4 rounded-2xl bg-white p-20 shadow-2xl sm:w-full md:w-140"
          noValidate
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
            <Typography
              variant="body2"
              component={"label"}
              sx={{ fontWeight: 500 }}
              className="text-gray-700"
            >
              Correo electrónico
            </Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              value={data.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              className="mb-1"
              size="medium"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          </Box>

          <Box className="mb-6 w-full">
            <Typography
              variant="body2"
              sx={{ fontWeight: 500 }}
              className="mb-2 font-semibold text-gray-700"
            >
              Contraseña
            </Typography>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              variant="outlined"
              value={data.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              className="mb-1"
              size="medium"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          </Box>

          <CustomButton
            type="submit"
            variant="contained"
            className="h-15 w-full rounded-xl py-3 font-medium"
            disabled={processing}
            tipo="primary"
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
            sx={{ "& a": { color: "#3b82f6", textDecoration: "none" } }}
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
