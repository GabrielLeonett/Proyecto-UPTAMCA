import ResponsiveAppBar from "../components/navbar";
import CustomToggleButtons from "../components/customChechBox";
import CardProfesor from "../components/cardProfesor";
import { Typography, Box, Grid, CircularProgress, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CustomLabel from "../components/customLabel";
import { useState, useEffect, useCallback } from "react";
import axios from "../apis/axios";
import { debounce } from '@mui/material/utils';
import {useTheme} from "@mui/material/styles";

export default function Profesores() {
  const theme = useTheme();
  const [profesores, setProfesores] = useState([]);
  const [filtroProfesores, setFiltroProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [dedicacion, setDedicacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [genero, setGenero] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    { value: "Núcleo de Tecnología y Ciencias Administrativas", label: "Núcleo de Tecnología y Ciencias Administrativas" },
    { value: "Núcleo de Humanidades y Ciencias Sociales", label: "Núcleo de Humanidades y Ciencias Sociales" },
  ];
  
  const generos = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
  ];

  const pages = [
    { name: 'Inicio', url: '/' },
    { 
      name: 'Profesor', 
      submenu: [
        { name: 'Ver', url: '/Profesores' },
        { name: 'Registrar', url: '/registerProfesor' },
      ]
    },
    { 
      name: 'PNF', 
      submenu: [
        { name: 'Ver', url: '/PNF' },
        { name: 'Registrar', url: '/registerPNF' },
      ]
    },
    { name: 'Contacto', url: '/contact' }
  ];

  // Función para buscar profesores
  const fetchProfesores = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchTerm ? "/Profesor/search" : "/Profesor";
      const payload = searchTerm ? { busqueda: searchTerm } : {};
      const { data } = await axios.get(endpoint, { params: payload });
      setProfesores(data.data || []);
      setFiltroProfesores(data.data || []);
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
    const resultadosFiltrados = profesores.filter(profesor => {
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

  return (
    <>
      <ResponsiveAppBar
        pages={pages}
        backgroundColor
      />
      
      <Box sx={{ pt: 12, px: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        <Grid container spacing={3}>
          <Grid size={3}>
            <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
              <Box mb={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Dedicación
                </Typography>
                <CustomToggleButtons
                  options={dedicaciones}
                  value={dedicacion}
                  onChange={handleDedicacionChange}
                />
              </Box>
              
              <Box mb={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Categoría
                </Typography>
                <CustomToggleButtons
                  options={categorias}
                  value={categoria}
                  onChange={handleCategoriaChange}
                />
              </Box>
              
              <Box mb={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Ubicación
                </Typography>
                <CustomToggleButtons
                  options={ubicaciones}
                  value={ubicacion}
                  onChange={handleUbicacionChange}
                />
              </Box>
              
              <Box mb={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Género
                </Typography>
                <CustomToggleButtons
                  options={generos}
                  value={genero}
                  onChange={handleGeneroChange}
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid size={9}>
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
          // Estilo para la etiqueta
          borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
          color: theme.palette.text.primary
        },
        "& .MuiInputLabel-shrink": {
          // Estilo para la etiqueta cuando el campo está enfocado o tiene valor
          borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
          color: theme.palette.text.primary
        },
        "& .MuiOutlinedInput-root": {
          // Estilo para el campo de entrada
          "& fieldset": {
            borderColor: theme.palette.primary.light, // Color del borde del campo
            color: theme.palette.text.primary
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
            color: theme.palette.text.primary
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main, // Color del borde cuando está enfocado
            color: theme.palette.text.primary
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
            ) : filtroProfesores.length === 0 ? (
              <Typography textAlign="center" my={4}>
                No se encontraron profesores con los filtros seleccionados
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filtroProfesores.map((profesor) => (
                  <Grid item xs={12} sm={6} lg={4} key={profesor.id}>
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