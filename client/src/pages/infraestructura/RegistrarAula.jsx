import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import ResponsiveAppBar from "../../components/navbar";
import CustomLabel from "../../components/customLabel";
import CustomButton from "../../components/customButton";
import axios from "../../apis/axios";
import { AulaSchema } from "../../schemas/AulaSchema";

export default function RegistrarAula() {
  const theme = useTheme();
  const pages = [{ name: "Inicio", link: "/" }, { name: "Ver Aulas", link: "/aulas" }];

  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(AulaSchema),
    mode: "onChange",
  });

  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);

  // 👉 Cargar sedes para el select
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get("/Sede/all");
        setSedes(response.data);
      } catch (error) {
        console.error("Error al cargar sedes:", error);
      } finally {
        setLoadingSedes(false);
      }
    };
    fetchSedes();
  }, []);

  const onSubmit = async (data) => {
    try {
      console.log("Datos enviados:", data);
      await axios.post("/Aula/create", data);

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "El aula ha sido registrada correctamente",
        confirmButtonColor: "#3085d6",
      });
      reset();
    } catch (error) {
      console.error("Error al registrar aula:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Hubo un problema al registrar el aula",
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
          Registrar Aula
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
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Código del Aula */}
              <CustomLabel
                id="codigo"
                name="codigo"
                label="Código del Aula"
                type="text"
                {...register("codigo")}
                error={!!errors.codigo}
                helperText={errors.codigo?.message || "Ingrese el código del aula"}
              />

              {/* Tipo de Aula */}
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <CustomLabel
                    select
                    id="tipo"
                    label="Tipo de Aula"
                    {...field}
                    error={!!errors.tipo}
                    helperText={errors.tipo?.message || "Seleccione el tipo de aula"}
                  >
                    <MenuItem value="Convencional">Convencional</MenuItem>
                    <MenuItem value="Interactiva">Interactiva</MenuItem>
                    <MenuItem value="Computación">Computación</MenuItem>
                    <MenuItem value="Exterior">Exterior</MenuItem>
                    <MenuItem value="Laboratorio">Laboratorio</MenuItem>
                  </CustomLabel>
                )}
              />

              {/* Select de Sedes */}
              {loadingSedes ? (
                <CircularProgress />
              ) : (
                <Controller
                  name="idSede"
                  control={control}
                  render={({ field }) => (
                    <CustomLabel
                      select
                      id="idSede"
                      label="Sede"
                      {...field}
                      error={!!errors.idSede}
                      helperText={errors.idSede?.message || "Seleccione la sede"}
                    >
                      {sedes.map((sede) => (
                        <MenuItem key={sede.id} value={sede.id}>
                          {sede.nombreSede}
                        </MenuItem>
                      ))}
                    </CustomLabel>
                  )}
                />
              )}
            </Box>

            {/* Botones */}
            <Box className="flex justify-end gap-4 mt-6">
              <CustomButton type="button" variant="outlined" color="secondary" onClick={() => reset()}>
                Limpiar
              </CustomButton>
              <CustomButton type="submit" variant="contained" color="primary">
                Registrar
              </CustomButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
