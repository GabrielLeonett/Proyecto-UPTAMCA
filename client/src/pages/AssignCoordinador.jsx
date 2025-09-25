import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import ResponsiveAppBar from "../components/navbar";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import axios from "../apis/axios";
import { AsignarCoordinadorSchema } from "../schemas/AsignarCoordinadorSchema";

export default function AssignCoordinador() {
  const theme = useTheme();
  const pages = [{ name: "Inicio", link: "/" }, { name: "Ver Coordinadores", link: "/coordinadores" }];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AsignarCoordinadorSchema),
    mode: "onChange",
  });

  const [profesores, setProfesores] = useState([]);
  const [pnfs, setPnfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 Cargar profesores y PNF
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProfesores, resPnfs] = await Promise.all([
          axios.get("/profesores"),
          axios.get("/pnf"),
        ]);
        setProfesores(resProfesores.data);
        setPnfs(resPnfs.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      console.log("Datos enviados:", data);
      await axios.post("/coordinador/asignar", data);

      Swal.fire({
        icon: "success",
        title: "¡Asignación exitosa!",
        text: "El profesor ha sido asignado como coordinador del PNF.",
        confirmButtonColor: "#3085d6",
      });
      reset();
    } catch (error) {
      console.error("Error al asignar coordinador:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Hubo un problema en la asignación",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <>
      <ResponsiveAppBar pages={pages} backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen bg-gray-100 p-4"
        sx={{ mt: 10, backgroundColor: theme.palette.background.default }}
      >
        <Typography variant="h2" gutterBottom sx={{ mt: 4, textAlign: "center" }}>
          Asignar Coordinador
        </Typography>

        <Box className="flex justify-center items-center flex-grow p-3">
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              width: "80%",
              p: 6,
              borderRadius: "25px",
              boxShadow: theme.shadows[10],
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Select Profesor */}
                <Controller
                  name="idProfesor"
                  control={control}
                  render={({ field }) => (
                    <CustomLabel
                      select
                      id="idProfesor"
                      label="Profesor"
                      {...field}
                      error={!!errors.idProfesor}
                      helperText={errors.idProfesor?.message || "Seleccione un profesor"}
                    >
                      {profesores.map((profe) => (
                        <MenuItem key={profe.id} value={profe.id}>
                          {profe.nombres} {profe.apellidos}
                        </MenuItem>
                      ))}
                    </CustomLabel>
                  )}
                />

                {/* Select PNF */}
                <Controller
                  name="idPnf"
                  control={control}
                  render={({ field }) => (
                    <CustomLabel
                      select
                      id="idPnf"
                      label="PNF"
                      {...field}
                      error={!!errors.idPnf}
                      helperText={errors.idPnf?.message || "Seleccione un PNF"}
                    >
                      {pnfs.map((pnf) => (
                        <MenuItem key={pnf.id} value={pnf.id}>
                          {pnf.nombre}
                        </MenuItem>
                      ))}
                    </CustomLabel>
                  )}
                />
              </Box>
            )}

            {/* Botones */}
            <Box className="flex justify-end gap-4 mt-6">
              <CustomButton type="button" variant="outlined" color="secondary" onClick={() => reset()}>
                Limpiar
              </CustomButton>
              <CustomButton type="submit" variant="contained" color="primary">
                Asignar
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
