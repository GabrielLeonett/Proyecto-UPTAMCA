import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, CircularProgress, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ResponsiveAppBar from "../../components/navbar";
import CustomLabel from "../../components/customLabel";
import CustomButton from "../../components/customButton";
import useApi from "../../hook/useApi"; // Added import for axios
import AulaSchema from "../../schemas/aula.schema";

export default function RegistrarAula() {
  const theme = useTheme();
  const axios = useApi();

  const {
    control,
    register,
    formState: { errors, isValid },
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(AulaSchema),
    mode: "onChange",
  });

  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(true);
  const [registering, setRegistering] = useState(false);

  // 👉 Cargar sedes para el select
  useEffect(() => {
    console.log("🔄 useEffect ejecutándose - cargando sedes");
    const fetchSedes = async () => {
      try {
        const response = await axios.get("/sedes");
        setSedes(response.sedes || []);
      } finally {
        setLoadingSedes(false);
      }
    };
    fetchSedes();
  }, [axios]);

  const onSubmit = async (data) => {
    setRegistering(true);

    try {
      // Asegurar que capacidad sea número
      const formData = {
        ...data,
        capacidad: Number(data.capacidad),
      };

      await axios.post("/aulas", formData);
    } finally {
      setRegistering(false);
    }
  };

  const handleReset = () => {
    reset({
      codigo: "",
      tipo: "",
      capacidad: "",
      id_sede: "",
    });
  };

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
                onClick={handleReset}
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
