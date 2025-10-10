import ResponsiveAppBar from "../../components/navbar";
import { CardCoordinador } from "../../components/cardCoordinador";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import axios from "../../apis/axios";

export default function Coordinadores() {
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para buscar coordinadores
  const fetchCoordinadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = "/Coordinadores";
      const { data } = await axios.get(endpoint);
      setCoordinadores(data.data || []);
    } catch (error) {
      console.error("Error cargando los coordinadores:", error);
      setError(
        "Error al cargar los coordinadores. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto inicial
  useEffect(() => {
    fetchCoordinadores();
  }, [fetchCoordinadores]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />
      <Box sx={{ pt: 15, px: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Coordinadores
        </Typography>

        {/* Lista de coordinadores */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
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
          ) : coordinadores.length === 0 ? (
            <Typography textAlign="center" my={4}>
              No se encontraron coordinadores con los filtros seleccionados
            </Typography>
          ) : (
            coordinadores.map((coordinador) => (
              <CardCoordinador coordinador={coordinador} />
            ))
          )}
        </Box>
      </Box>
    </>
  );
}
