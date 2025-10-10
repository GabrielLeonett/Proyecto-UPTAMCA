import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import ResponsiveAppBar from "../components/navbar";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import axios from "../apis/axios";
import { AulaSchema } from "../schemas/AulaSchema";

export default function RegisterAula() {
  const theme = useTheme();

  console.log("🔵 Componente RegisterAula montado");

  const {
    control,
    register,
    formState: { errors, isValid, dirtyFields },
    handleSubmit,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(AulaSchema),
    mode: "onChange",
  });

  // 👉 Watch form values for debugging
  const formValues = watch();
  console.log("📝 Valores del formulario:", formValues);
  console.log("❌ Errores del formulario:", errors);
  console.log("✅ Formulario válido:", isValid);
  console.log("✏️ Campos modificados:", dirtyFields);

  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [registering, setRegistering] = useState(false);

  // 👉 Cargar sedes para el select
  useEffect(() => {
    console.log("🔄 useEffect ejecutándose - cargando sedes");
    const fetchSedes = async () => {
      try {
        console.log("🌐 Haciendo petición GET a /Sedes");
        const response = await axios.get("/Sedes");
        console.log("✅ Respuesta de sedes:", response.data.data);
        setSedes(response.data.data);
        console.log("📊 Sedes cargadas en estado:", response.data.data.length);
      } catch (error) {
        console.error("❌ Error al cargar sedes:", error);
        console.error("📞 Detalles del error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las sedes",
          confirmButtonColor: "#d33",
        });
      } finally {
        console.log("🏁 Finalizando carga de sedes");
        setLoadingSedes(false);
      }
    };
    fetchSedes();
  }, []);

  const onSubmit = async (data) => {
    console.log("🚀 Iniciando envío del formulario");
    console.log("📦 Datos recibidos del formulario:", data);
    console.log("🔄 Estado registering:", registering);

    setRegistering(true);
    console.log("🔄 Estado registering actualizado a:", true);

    try {
      // Asegurar que capacidad sea número
      const formData = {
        ...data,
        capacidad: Number(data.capacidad),
      };

      console.log("🔢 Datos procesados para enviar:", formData);
      console.log("📤 Tipo de capacidad:", typeof formData.capacidad);
      console.log("🌐 Enviando POST a /Aula/register");

      const response = await axios.post("/Aula/register", formData);

      console.log("✅ Respuesta del servidor:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "El aula ha sido registrada correctamente",
        confirmButtonColor: "#3085d6",
      });

      console.log("🔄 Reseteando formulario...");
      reset();
      console.log("✅ Formulario reseteado");
    } catch (error) {
      console.error("❌ Error completo al registrar aula:", error);
      console.error("📞 Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Hubo un problema al registrar el aula",
        confirmButtonColor: "#d33",
      });
    } finally {
      console.log("🏁 Finalizando proceso de registro");
      setRegistering(false);
      console.log("🔄 Estado registering actualizado a:", false);
    }
  };

  const handleReset = () => {
    console.log("🔄 Botón Limpiar clickeado");
    console.log("📝 Valores antes de resetear:", formValues);

    reset({
      codigo: "",
      tipo: "",
      capacidad: "",
      id_sede: "",
    });

    console.log("✅ Formulario reseteado a valores vacíos");
  };

  console.log("🎯 Estado actual del componente:", {
    loadingSedes,
    registering,
    sedesCount: sedes.length,
    isValid,
    hasErrors: Object.keys(errors).length > 0,
  });

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen bg-gray-100 p-4"
        sx={{
          mt: 10,
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            mt: 4,
            textAlign: "center",
            fontWeight: "bold",
            color: theme.palette.primary.main,
            mb: 4,
          }}
        >
          Registrar Aula
        </Typography>

        <Box className="flex justify-center items-start flex-grow">
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit((data) => {
              console.log("📝 handleSubmit ejecutado con datos:", data);
              onSubmit(data);
            })}
            sx={{
              backgroundColor: theme.palette.background.paper,
              width: "90%",
              maxWidth: "800px",
              p: 4,
              borderRadius: "16px",
              boxShadow: theme.shadows[5],
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={3}>
              {/* Código del Aula */}
              <Grid item xs={12} md={6}>
                <CustomLabel
                  id="codigo"
                  name="codigo"
                  label="Código del Aula"
                  type="text"
                  {...register("codigo", {
                    onChange: (e) => {
                      console.log("📝 Campo codigo cambiado:", e.target.value);
                    },
                  })}
                  error={!!errors.codigo}
                  helperText={
                    errors.codigo?.message || "Ingrese el código del aula"
                  }
                  fullWidth
                />
              </Grid>

              {/* Tipo de Aula */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <CustomLabel
                      select
                      id="tipo"
                      label="Tipo de Aula"
                      {...field}
                      onChange={(e) => {
                        console.log("📝 Campo tipo cambiado:", e.target.value);
                        field.onChange(e);
                      }}
                      error={!!errors.tipo}
                      helperText={
                        errors.tipo?.message || "Seleccione el tipo de aula"
                      }
                      fullWidth
                    >
                      <MenuItem value="">
                        <em>Seleccionar tipo</em>
                      </MenuItem>
                      <MenuItem value="Convencional">Convencional</MenuItem>
                      <MenuItem value="Interactiva">Interactiva</MenuItem>
                      <MenuItem value="Computación">Computación</MenuItem>
                      <MenuItem value="Exterior">Exterior</MenuItem>
                      <MenuItem value="Laboratorio">Laboratorio</MenuItem>
                    </CustomLabel>
                  )}
                />
              </Grid>

              {/* Capacidad */}
              <Grid item xs={12} md={6}>
                <CustomLabel
                  id="capacidad"
                  label="Capacidad de Aula"
                  type="number"
                  error={!!errors.capacidad}
                  {...register("capacidad", {
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = value === "" ? "" : Number(value);
                      console.log(
                        "🔢 Campo capacidad convertido:",
                        value,
                        "→",
                        numValue
                      );
                      return numValue;
                    },
                    onChange: (e) => {
                      console.log(
                        "📝 Campo capacidad cambiado:",
                        e.target.value
                      );
                    },
                  })}
                  helperText={
                    errors.capacidad?.message || "Ingrese la capacidad del aula"
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>

              {/* Select de Sedes */}
              <Grid item xs={12} md={6}>
                {loadingSedes ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="56px"
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Cargando sedes...
                    </Typography>
                  </Box>
                ) : (
                  <Controller
                    name="id_sede"
                    control={control}
                    render={({ field }) => (
                      <CustomLabel
                        select
                        id="id_sede"
                        label="Sede"
                        {...field}
                        onChange={(e) => {
                          console.log(
                            "📝 Campo id_sede cambiado:",
                            e.target.value
                          );
                          field.onChange(e);
                        }}
                        error={!!errors.id_sede}
                        helperText={
                          errors.id_sede?.message || "Seleccione la sede"
                        }
                        fullWidth
                      >
                        <MenuItem value="">
                          <em>Seleccionar sede</em>
                        </MenuItem>
                        {sedes.map((sede) => (
                          <MenuItem
                            key={sede.id_sede}
                            value={sede.id_sede}
                            onClick={() =>
                              console.log("🎯 Sede seleccionada:", sede)
                            }
                          >
                            {sede.nombre_sede}
                          </MenuItem>
                        ))}
                      </CustomLabel>
                    )}
                  />
                )}
              </Grid>
            </Grid>

            {/* Botones */}
            <Box
              className="flex justify-end gap-4 mt-6 pt-4"
              sx={{ borderTop: 1, borderColor: "divider" }}
            >
              <CustomButton
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  console.log(
                    "🔄 Botón Limpiar clickeado - estado actual:",
                    formValues
                  );
                  handleReset();
                }}
                disabled={registering}
                sx={{ minWidth: "120px" }}
              >
                Limpiar
              </CustomButton>
              <CustomButton
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid || registering || loadingSedes}
                onClick={() =>
                  console.log(
                    "🚀 Botón Registrar clickeado - estado válido:",
                    isValid
                  )
                }
                sx={{ minWidth: "120px" }}
              >
                {registering ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    Registrando...
                  </Box>
                ) : (
                  "Registrar"
                )}
              </CustomButton>
            </Box>

            {/* Mensaje de validación */}
            {!isValid && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Complete todos los campos correctamente para habilitar el
                registro
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
