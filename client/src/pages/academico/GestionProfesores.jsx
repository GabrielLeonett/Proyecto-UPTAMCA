import ResponsiveAppBar from "../../components/navbar";
import CardProfesor from "../../components/cardProfesor";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi";

export default function GestionProfesores() {
  const axios = useApi(false);

  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para buscar profesores
  const fetchProfesores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = "/profesores";
      const data = await axios.get(endpoint);
      console.log("🔍 Profesores obtenidos:", data);
      // Asegurarse de que response sea un array
      let profesoresData = data.profesores || [];

      setProfesores(profesoresData);
    } catch (err) {
      console.error("❌ Error al cargar profesores:", err);
      setError("Error al cargar los profesores.");
    } finally {
      setLoading(false);
    }
  }, [axios]);

  // Cargar profesores una sola vez
  useEffect(() => {
    fetchProfesores();
  }, []);

  // Filtrar profesores según búsqueda
  const profesoresFiltrados = profesores.filter((prof) =>
    `${prof.nombre || ""} ${prof.apellido || ""} ${prof.cedula || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        {/* 🔍 Barra de búsqueda */}
        <Box display="flex"  mb={3}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar profesor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: "300px" } }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando profesores...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" my={4}>
            {error}
          </Typography>
        ) : profesoresFiltrados.length === 0 ? (
          <Typography textAlign="center" my={4}>
            No se encontraron profesores
          </Typography>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              width: "100%",
              margin: 0,
            }}
          >
            {profesoresFiltrados.map((profesor) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={profesor.cedula}
              >
                <CardProfesor profesor={profesor} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}
