import ResponsiveAppBar from "../../components/navbar";
import CardProfesor from "../../components/cardProfesor";
import { Typography, Box, Grid, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi";

export default function GestionProfesores() {
  const axios = useApi(false);

  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para buscar profesores - SIMPLIFICADA
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
    } finally {
      setLoading(false);
    }
  }, [axios]); // ✅ Solo axios como dependencia

  // Efecto inicial para cargar profesores - SOLO UNA VEZ
  useEffect(() => {
    fetchProfesores();
  }, []); // ✅ Array de dependencias VACÍO - se ejecuta solo una vez

  // Debug: ver qué está pasando
  useEffect(() => {
    console.log("📈 Estado actual:", {
      loading,
      error: error?.substring(0, 50) + "...",
      cantidadProfesores: profesores.length,
    });
  }, [loading, error, profesores.length]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando profesores...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" my={4}>
            {error}
          </Typography>
        ) : profesores.length === 0 ? (
          <Typography textAlign="center" my={4}>
            No hay profesores registrados
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
            {profesores.map((profesor) => (
              <Grid
                item
                xs={12} // 1 columna en móvil
                sm={6} // 2 columnas en tablet
                md={4} // 3 columnas en desktop
                lg={3} // 4 columnas en large
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
