import ResponsiveAppBar from "../../components/navbar";
import CardProfesor from "../../components/cardProfesor";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CustomLabel from "../../components/customLabel";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi";
import { debounce } from "@mui/material/utils";
import { useTheme } from "@mui/material/styles";

export default function GestionProfesores() {
  const theme = useTheme();
  const axios = useApi();

  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para buscar profesores
  const fetchProfesores = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = "/Profesor";
      const response = await axios.get(endpoint);

      // Asegurarse de que response sea un array, incluso si la API devuelve undefined/null
      let profesoresData = response?.data || response || [];
      
      // Si no es un array, convertirlo a array vacío
      if (!Array.isArray(profesoresData)) {
        console.warn("La respuesta de la API no es un array:", profesoresData);
        profesoresData = [];
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        profesoresData = profesoresData.filter(profesor => 
          profesor?.nombre?.toLowerCase().includes(term) ||
          profesor?.apellido?.toLowerCase().includes(term) ||
          profesor?.cedula?.toString().includes(term)
        );
      }

      setProfesores(profesoresData);
    } catch (error) {
      console.error("Error cargando los profesores:", error);
      setError("Error al cargar los profesores. Por favor intenta nuevamente.");
      setProfesores([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  }, [axios]);

  // Debounce para la búsqueda
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      fetchProfesores(searchTerm);
    }, 500),
    [fetchProfesores]
  );

  // Efecto inicial para cargar profesores
  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]);

  const handleBusquedaChange = (e) => {
    const value = e.target.value;
    setBusqueda(value);
    debouncedSearch(value);
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        <Grid container spacing={3}>
          {/* Contenido principal */}
          <Grid item xs={12}>
            <CustomLabel
              id="busqueda"
              name="busqueda"
              label="Buscar Profesor"
              type="text"
              variant="outlined"
              helperText="Buscar Profesor por: Nombre, Apellido o Cédula"
              value={busqueda}
              onChange={handleBusquedaChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiInputLabel-root": {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.text.primary,
                },
                "& .MuiInputLabel-shrink": {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.text.primary,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.primary.light,
                    color: theme.palette.text.primary,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.text.primary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.text.primary,
                  },
                },
              }}
            />

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" textAlign="center" my={4}>
                {error}
              </Typography>
            ) : !profesores || profesores.length === 0 ? ( // ✅ Agregada verificación de null/undefined
              <Typography textAlign="center" my={4}>
                {busqueda 
                  ? "No se encontraron profesores con los criterios de búsqueda" 
                  : "No hay profesores registrados"
                }
              </Typography>
            ) : (
              <Grid container spacing={3} justifyContent={"center"}>
                {profesores.map((profesor) => (
                  <Grid item xs={12} sm={6} lg={4} key={profesor.cedula || profesor.id}>
                    <CardProfesor profesor={profesor} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}