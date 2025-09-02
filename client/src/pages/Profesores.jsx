import ResponsiveAppBar from "../components/navbar";
import CardProfesor from "../components/cardProfesor";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import axios from "../apis/axios";

export default function Profesores() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Función para buscar profesores
  const fetchProfesores = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchTerm ? "/Profesor/search" : "/Profesor";
      const payload = searchTerm ? { busqueda: searchTerm } : {};
      const { data } = await axios.get(endpoint, { params: payload });
      setProfesores(data.data.data || []);
    } catch (error) {
      console.error("Error cargando los profesores:", error);
      setError("Error al cargar los profesores. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto inicial para cargar profesores
  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />
      <Box sx={{ pt: 15, px: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" textAlign="center" my={4}>
              {error}
            </Typography>
          ) : profesores.length === 0 ? (
            <Typography textAlign="center" my={4}>
              No se encontraron profesores con los filtros seleccionados
            </Typography>
          ) : (
            profesores.map((profesor) => (
              <CardProfesor key={profesor.id} profesor={profesor} />
            ))
          )}
        </Box>
      </Box>
    </>
  );
}
