import ResponsiveAppBar from "../../components/navbar";
import CustomToggleButtons from "../../components/customChechBox";
import CardProfesor from "../../components/cardProfesor";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  InputAdornment,
  Drawer,
  IconButton,
  Button,
  Chip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import CustomLabel from "../../components/customLabel";
import { useState, useEffect, useCallback } from "react";
import axios from "../../apis/axios";
import { debounce } from "@mui/material/utils";
import { useTheme } from "@mui/material/styles";

export default function GestionProfesores() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [profesores, setProfesores] = useState([]);
  const [filtroProfesores, setFiltroProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [dedicacion, setDedicacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [genero, setGenero] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Opciones para los filtros
  const dedicaciones = [
    { value: "Convencional", label: "Convencional" },
    { value: "Tiempo Completo", label: "Tiempo Completo" },
    { value: "Medio Tiempo", label: "Medio Tiempo" },
    { value: "Exclusivo", label: "Exclusivo" },
  ];

  const categorias = [
    { value: "Instructor", label: "Instructor" },
    { value: "Asistente", label: "Asistente" },
    { value: "Asociado", label: "Asociado" },
    { value: "Agregado", label: "Agregado" },
    { value: "Titular", label: "Titular" },
  ];

  const ubicaciones = [
    { value: "Núcleo de Salud y Deporte", label: "Núcleo de Salud y Deporte" },
    {
      value: "Núcleo de Tecnología y Ciencias Administrativas",
      label: "Núcleo de Tecnología y Ciencias Administrativas",
    },
    {
      value: "Núcleo de Humanidades y Ciencias Sociales",
      label: "Núcleo de Humanidades y Ciencias Sociales",
    },
  ];

  const generos = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
  ];

  // Calcular filtros activos
  useEffect(() => {
    let count = 0;
    if (dedicacion) count++;
    if (categoria) count++;
    if (ubicacion) count++;
    if (genero) count++;
    setActiveFiltersCount(count);
  }, [dedicacion, categoria, ubicacion, genero]);

  // Función para buscar profesores
  const fetchProfesores = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchTerm ? "/Profesor/search" : "/Profesor";
      const payload = searchTerm ? { busqueda: searchTerm } : {};
      const response = await axios.get(endpoint, { params: payload });

      setProfesores(response.data.data.data || []);
      setFiltroProfesores(response.data.data.data || []);
    } catch (error) {
      console.error("Error cargando los profesores:", error);
      setError("Error al cargar los profesores. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Efecto para filtrar profesores
  useEffect(() => {
    const resultadosFiltrados = profesores.filter((profesor) => {
      return (
        (dedicacion === "" || profesor.dedicacion === dedicacion) &&
        (categoria === "" || profesor.categoria === categoria) &&
        (ubicacion === "" || profesor.ubicacion === ubicacion) &&
        (genero === "" || profesor.genero === genero)
      );
    });
    setFiltroProfesores(resultadosFiltrados);
  }, [dedicacion, categoria, ubicacion, genero, profesores]);

  // Handlers para los filtros
  const handleDedicacionChange = (newValue) => {
    setDedicacion(newValue === dedicacion ? "" : newValue);
  };

  const handleCategoriaChange = (newValue) => {
    setCategoria(newValue === categoria ? "" : newValue);
  };

  const handleUbicacionChange = (newValue) => {
    setUbicacion(newValue === ubicacion ? "" : newValue);
  };

  const handleGeneroChange = (newValue) => {
    setGenero(newValue === genero ? "" : newValue);
  };

  const handleBusquedaChange = (e) => {
    const value = e.target.value.trim();
    setBusqueda(value);
    debouncedSearch(value);
  };

  const handleClearFilters = () => {
    setDedicacion("");
    setCategoria("");
    setUbicacion("");
    setGenero("");
  };

  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case 'dedicacion':
        setDedicacion("");
        break;
      case 'categoria':
        setCategoria("");
        break;
      case 'ubicacion':
        setUbicacion("");
        break;
      case 'genero':
        setGenero("");
        break;
      default:
        break;
    }
  };

  // Componente de Filtros (reutilizable)
  const FiltersContent = () => (
    <>
      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Dedicación
        </Typography>
        <CustomToggleButtons
          options={dedicaciones}
          value={dedicacion}
          onChange={handleDedicacionChange}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Categoría
        </Typography>
        <CustomToggleButtons
          options={categorias}
          value={categoria}
          onChange={handleCategoriaChange}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Ubicación
        </Typography>
        <CustomToggleButtons
          options={ubicaciones}
          value={ubicacion}
          onChange={handleUbicacionChange}
        />
      </Box>

      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Género
        </Typography>
        <CustomToggleButtons
          options={generos}
          value={genero}
          onChange={handleGeneroChange}
        />
      </Box>

      {activeFiltersCount > 0 && (
        <Button 
          variant="outlined" 
          onClick={handleClearFilters}
          fullWidth
        >
          Limpiar Filtros
        </Button>
      )}
    </>
  );

  // Chips para mostrar filtros activos
  const ActiveFiltersChips = () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
      {dedicacion && (
        <Chip
          label={`Dedicación: ${dedicacion}`}
          onDelete={() => handleRemoveFilter('dedicacion')}
          size="small"
        />
      )}
      {categoria && (
        <Chip
          label={`Categoría: ${categoria}`}
          onDelete={() => handleRemoveFilter('categoria')}
          size="small"
        />
      )}
      {ubicacion && (
        <Chip
          label={`Ubicación: ${ubicacion}`}
          onDelete={() => handleRemoveFilter('ubicacion')}
          size="small"
        />
      )}
      {genero && (
        <Chip
          label={`Género: ${genero}`}
          onDelete={() => handleRemoveFilter('genero')}
          size="small"
        />
      )}
    </Stack>
  );

  return (
    <>
      <ResponsiveAppBar
        pages={["registerProfesor", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />

      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        {/* Header móvil con botón de filtros */}
        {isMobile && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                endIcon={activeFiltersCount > 0 ? `(${activeFiltersCount})` : null}
                onClick={() => setFiltersOpen(true)}
                fullWidth
              >
                Filtros
              </Button>
            </Box>
            <ActiveFiltersChips />
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Sidebar de filtros para desktop */}
          {!isMobile && (
            <Grid item md={3}>
              <Box sx={{ position: "sticky", top: 100 }}>
                <Typography variant="h6" gutterBottom>
                  Filtros
                </Typography>
                <FiltersContent />
                {activeFiltersCount > 0 && <ActiveFiltersChips />}
              </Box>
            </Grid>
          )}

          {/* Contenido principal */}
          <Grid item xs={12} md={9}>
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

            {/* Mostrar filtros activos en desktop */}
            {!isMobile && activeFiltersCount > 0 && (
              <Box sx={{ mt: 2 }}>
                <ActiveFiltersChips />
              </Box>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" textAlign="center" my={4}>
                {error}
              </Typography>
            ) : filtroProfesores.length === 0 ? (
              <Typography textAlign="center" my={4}>
                No se encontraron profesores con los filtros seleccionados
              </Typography>
            ) : (
              <Grid container spacing={3} justifyContent={'center'}>
                {filtroProfesores.map((profesor) => (
                  <Grid item xs={12} sm={6} lg={4} key={profesor.cedula}>
                    <CardProfesor profesor={profesor} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Drawer de filtros para móvil */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <FiltersContent />
      </Drawer>
    </>
  );
}