import {
  Typography,
  Box,
  Grid,
  Tooltip,
  InputAdornment,
  Stack,
  Pagination,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Route as RouteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../../hook/useApi";
import { useNavigate, useParams } from "react-router-dom";
import ResponsiveAppBar from "../../../components/navbar";
import CardProfesor from "../../../components/cardProfesor";
import SkeletonProfesores from "../../../components/SkeletonProfesores";
import CustomButton from "../../../components/customButton";
import { useTour } from "../../../hook/useTour";
import CustomAutocomplete from "../../../components/CustomAutocomplete";
import CustomLabel from "../../../components/customLabel";

export default function GestionProfesores() {
  const axios = useApi(false);
  const navigate = useNavigate();

  const [profesores, setProfesores] = useState([]);
  const [profesorSearch, setProfesorSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id_profesor } = useParams();

  // Función para buscar profesores
  const fetchProfesores = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = "/profesores";
      const data = await axios.get(endpoint);

      let profesoresData = data.profesores || [];

      if (id_profesor) {
        const profesorEncontrado = profesoresData.find(
          (profesor) =>
            profesor.cedula === id_profesor || profesor.id === id_profesor
        );

        if (profesorEncontrado) {
          const otrosProfesores = profesoresData.filter(
            (profesor) =>
              profesor.cedula !== id_profesor && profesor.id !== id_profesor
          );
          setProfesores(otrosProfesores);
        } else {
          setProfesores(profesoresData);
        }
      } else {
        setProfesores(profesoresData);
      }
    } catch (err) {
      console.error("❌ Error cargando profesores:", err);
      setProfesores([]);
    } finally {
      setLoading(false);
    }
  }, [axios, id_profesor]);

  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]);

  const { startTour, resetTour } = useTour(
    [
      {
        intro: "👋 Bienvenido al módulo de gestión de profesores.",
      },
      {
        element: "#profesores-container",
        intro: "Aquí se muestran todos los profesores registrados.",
        position: "right",
      },
      {
        element: "#btn-registrar-profesor",
        intro: "Haz clic aquí para registrar un nuevo profesor.",
        position: "left",
      },
      {
        element: "#btn-reiniciar-tour",
        intro: "Puedes volver a ver este recorrido cuando quieras.",
        position: "top",
      },
    ],
    "tourGestionProfesores"
  );

  useEffect(() => {
    if (!loading && profesores.length > 0) {
      startTour();
    }
  }, [loading, profesores, startTour]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box mt={12} p={3}>
        <Typography variant="h3" fontWeight={600} mb={1}>
          Gestión de Profesores
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Visualizar, Editar y Crear Profesores
        </Typography>

        <Box sx={{ m: 3 }}>
          <CustomAutocomplete
            options={profesores}
            getOptionLabel={
              (profesor) => `${profesor.nombres} ${profesor.apellidos}` // ← RETURN implícito
            }
            value={null}
            onChange={(event, newValue) => {
              // ← CORREGIDO
              setProfesorSearch(newValue?.id_profesor);
              console.log("Profesor seleccionado:", newValue);
            }}
            renderInput={(params) => (
              <CustomLabel
                {...params}
                label="Buscar profesor"
                placeholder="Nombre, apellido o cédula"
                InputProps={{
                  ...params.InputProps,
                  // ← CORREGIDO: dentro de InputProps
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.id_profesor === value?.id_profesor
            }
            filterOptions={(options, { inputValue }) => {
              return options.filter(
                (option) =>
                  option.nombres
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  option.apellidos
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase()) ||
                  option.cedula
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase())
              );
            }}
            noOptionsText="No se encontraron profesores"
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SkeletonProfesores />
            <SkeletonProfesores />
            <SkeletonProfesores />
          </Box>
        ) : (
          <Box id="profesores-container">
            {profesores.length === 0 ? (
              <Typography textAlign="center" my={4}>
                No hay más profesores registrados
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ width: "100%", margin: 0 }}>
                {profesores.map((profesor) => (
                  <Grid item key={profesor.cedula || profesor.id}>
                    <CardProfesor
                      profesor={profesor}
                      isSearch={!!id_profesor}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        <Tooltip title="Registrar Profesor" placement="left-start">
          <CustomButton
            id="btn-registrar-profesor"
            onClick={() => navigate("/academico/profesores/registrar")}
            sx={{
              position: "fixed",
              bottom: 78,
              right: 24,
              minWidth: "auto",
              width: 48,
              height: 48,
              borderRadius: "50%",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Registrar Profesor"
          >
            <PersonAddIcon />
          </CustomButton>
        </Tooltip>

        <Tooltip title="Tutorial" placement="left-start">
          <CustomButton
            id="btn-reiniciar-tour"
            variant="contained"
            onClick={resetTour}
            sx={{
              position: "fixed",
              bottom: 128,
              right: 24,
              minWidth: "auto",
              width: 48,
              height: 48,
              borderRadius: "50%",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Ver tutorial"
          >
            <RouteIcon />
          </CustomButton>
        </Tooltip>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            my: 3,
          }}
        >
          <Stack>
            <Pagination count={10} color="primary" shape="rounded" />
          </Stack>
        </Box>
      </Box>
    </>
  );
}
