import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  Alert,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import ResponsiveAppBar from "../components/navbar";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import axios from "../apis/axios";
import { AsignarCoordinadorSchema } from "../schemas/AsignarCoordinadorSchema";

export default function AsignarCoordinador() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(AsignarCoordinadorSchema),
    mode: "onChange",
    defaultValues: {
      idProfesor: "",
      idPnf: "",
    },
  });

  const [profesores, setProfesores] = useState([]);
  const [pnfs, setPnfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 Cargar profesores y PNF
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProfesores, resPnfs] = await Promise.all([
          axios.get("/Profesor"),
          axios.get("/PNF"),
        ]);

        // Extraer datos según la estructura de tu API
        let datosProfesores = [];
        let datosPnfs = [];

        // Para profesores - ajusta según tu estructura real
        if (resProfesores.data && resProfesores.data.data) {
          if (Array.isArray(resProfesores.data.data.data)) {
            datosProfesores = resProfesores.data.data.data;
          } else if (Array.isArray(resProfesores.data.data)) {
            datosProfesores = resProfesores.data.data;
          }
        }

        // Para PNFs - ajusta según tu estructura real
        if (resPnfs.data && resPnfs.data.data) {
          if (Array.isArray(resPnfs.data.data)) {
            datosPnfs = resPnfs.data.data;
          } else if (Array.isArray(resPnfs.data)) {
            datosPnfs = resPnfs.data;
          }
        }

        console.log("Todos los profesores:", datosProfesores);

        // Filtrar solo profesores que NO son coordinadores Y tienen estado activo: false
        const profesoresFiltrados = datosProfesores.filter(
          (profe) => !profe.is_coordinador && profe.activo === false
        );

        const pnfsFiltrados = datosPnfs.filter(
          (pnf) => !pnf.tiene_coordinar != true
        );

       

        setProfesores(profesoresFiltrados);
        setPnfs(pnfsFiltrados);
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

      // Asegúrate de que los nombres de los campos coincidan con tu backend
      const payload = {
        cedula_profesor: data.idProfesor,
        id_pnf: data.idPnf,
      };

      console.log("Payload:", payload);

      await axios.post("/Coordinador/asignar", payload);

      await Swal.fire({
        icon: "success",
        title: "¡Asignación exitosa!",
        text: "El profesor ha sido asignado como coordinador del PNF.",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        showConfirmButton: true,
      });

      reset();

      // Recargar lista de profesores para actualizar coordinadores
      const resProfesores = await axios.get("/Profesor");
      let nuevosProfesores = [];

      if (resProfesores.data && resProfesores.data.data) {
        if (Array.isArray(resProfesores.data.data.data)) {
          nuevosProfesores = resProfesores.data.data.data;
        } else if (Array.isArray(resProfesores.data.data)) {
          nuevosProfesores = resProfesores.data.data;
        }
      }

      const profesoresFiltrados = nuevosProfesores.filter(
        (profe) => !profe.is_coordinador
      );
      setProfesores(profesoresFiltrados);
    } catch (error) {
      console.error("Error al asignar coordinador:", error);

      // Manejo mejorado de errores
      let errorMessage = "Hubo un problema en la asignación";

      if (error.response) {
        // El servidor respondió con un código de error
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        errorMessage =
          "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else {
        // Algo pasó al configurar la solicitud
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleReset = () => {
    reset();
  };

  if (loading) {
    return (
      <>
        <ResponsiveAppBar backgroundColor />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            mt: 8,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Container maxWidth="lg" sx={{ mt: 15, mb: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: isMobile ? "2rem" : "2.5rem",
            }}
          >
            Asignar Coordinador
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: isMobile ? "1rem" : "1.1rem" }}
          >
            Seleccione un profesor y un PNF para asignar como coordinador
          </Typography>
        </Box>

        {/* Formulario */}
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[8],
                overflow: "visible",
              }}
            >
              <CardContent sx={{ p: isMobile ? 3 : 5 }}>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ width: "100%" }}
                >
                  <Grid container spacing={4}>
                    {/* Select Profesor */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="idProfesor"
                        control={control}
                        render={({ field }) => (
                          <CustomLabel
                            select
                            fullWidth
                            id="idProfesor"
                            label="Profesor"
                            {...field}
                            error={!!errors.idProfesor}
                            helperText={
                              errors.idProfesor?.message ||
                              "Seleccione un profesor"
                            }
                            size={isMobile ? "small" : "medium"}
                          >
                            {profesores.length > 0 ? (
                              profesores.map((profe) => (
                                <MenuItem
                                  key={profe.id_profesor || profe.id}
                                  value={parseInt(profe.cedula)}
                                >
                                  {profe.nombres} {profe.apellidos}
                                  {profe.cedula && ` - ${profe.cedula}`}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled value="">
                                No existe un profesor válido
                              </MenuItem>
                            )}
                          </CustomLabel>
                        )}
                      />
                    </Grid>

                    {/* Select PNF */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="idPnf"
                        control={control}
                        render={({ field }) => (
                          <CustomLabel
                            select
                            fullWidth
                            id="idPnf"
                            label="Programa Nacional de Formación (PNF)"
                            {...field}
                            error={!!errors.idPnf}
                            helperText={
                              errors.idPnf?.message || "Seleccione un PNF"
                            }
                            size={isMobile ? "small" : "medium"}
                          >
                            {pnfs.length > 0 ? (
                              pnfs.map((pnf) => (
                                <MenuItem
                                  key={pnf.id_pnf || pnf.id}
                                  value={pnf.id_pnf || pnf.id}
                                >
                                  {pnf.nombre_pnf || pnf.nombre}
                                  {pnf.codigo_pnf && ` (${pnf.codigo_pnf})`}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled value="">
                                No existe un PNF válido
                              </MenuItem>
                            )}
                          </CustomLabel>
                        )}
                      />
                    </Grid>
                  </Grid>

                  {/* Botones */}
                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: 2,
                      justifyContent: "flex-end",
                    }}
                  >
                    <CustomButton
                      type="button"
                      variant="outlined"
                      tipo="secondary"
                      onClick={handleReset}
                      fullWidth={isMobile}
                      disabled={isSubmitting}
                    >
                      Limpiar Formulario
                    </CustomButton>
                    <CustomButton
                      type="submit"
                      variant="contained"
                      tipo="primary"
                      fullWidth={isMobile}
                      disabled={isSubmitting || !isValid}
                      loading={isSubmitting}
                    >
                      {isSubmitting ? "Asignando..." : "Asignar Coordinador"}
                    </CustomButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Información adicional */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Nota:</strong> Solo se muestran profesores que no son
            coordinadores actualmente.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            La asignación puede ser modificada posteriormente desde el panel de
            administración.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
