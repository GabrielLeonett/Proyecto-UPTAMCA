import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomLabel from "../../components/customLabel";
import ResponsiveAppBar from "../../components/navbar";
import { SedeSchema } from "../../schemas/SedeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../components/customButton"; // 👈 Importamos tu botón
import useApi from "../hook/useApi"; // Added import for axios

export default function RegisterSede() {
  const pages = [{ name: "Inicio", link: "/Profesores" }];
  const theme = useTheme();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset, // 👈 aquí está el reset de react-hook-form
  } = useForm({
    resolver: zodResolver(SedeSchema),
    mode: "onChange",
    shouldFocusError: true,
  });
  const axios = useApi();

  const onSubmit = async (data) => {
    try {
      await axios.post("/Sede/create", data);

      reset(); // 👈 Limpia el formulario después de registrar
    } catch (error) {
      console.error("Error al registrar la sede:", error);
    }
  };

  return (
    <>
      <ResponsiveAppBar pages={pages} backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen bg-gray-100 p-4"
        sx={{
          mt: 10,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "screen",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ mt: 4, ml: 6 }} // 👈 Lo subimos un poco
        >
          Registrar Sedes
        </Typography>

        <Box className="flex justify-center items-center flex-grow p-3">
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              width: "80%",
              padding: "40px", // 👈 menos padding para subirlo
              borderRadius: "25px",
              boxShadow: theme.shadows[10],
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6">
              <CustomLabel
                id="nombre de la sede"
                name="nombreSede"
                label="Nombre de la Sede"
                type="text"
                variant="outlined"
                {...register("nombreSede")}
                error={!!errors.nombreSede}
                helperText={
                  errors.nombreSede?.message ||
                  "Ingrese el nombre de la sede completos"
                }
              />

              <CustomLabel
                id="ubicacion de la sede"
                name="ubicacionSede"
                label="Ubicación de la Sede"
                type="text"
                variant="outlined"
                {...register("UbicacionSede")}
                error={!!errors.UbicacionSede}
                helperText={
                  errors.UbicacionSede?.message ||
                  "Ingrese la ubicación de la sede completas"
                }
              />

              <CustomLabel
                id="enlace google maps"
                name="GoogleSede"
                label="GoogleSede"
                type="text"
                variant="outlined"
                {...register("GoogleSede")}
                error={!!errors.direccion}
                helperText={
                  errors.direccion?.message ||
                  "Ingrese el enlace de Google Maps"
                }
              />
            </Box>

            {/* 👇 Botones añadidos */}
            <Box className="flex justify-end gap-4 mt-6 px-10">
              <CustomButton
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => reset()} // 👈 esto sí limpia el formulario
              >
                Limpiar
              </CustomButton>

              <CustomButton
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
              >
                Registrar
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
