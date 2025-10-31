import ResponsiveAppBar from "../../components/navbar";
import { CardCoordinador } from "../../components/cardCoordinador";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi"; // Added import for axios

export default function Coordinadores() {
  const axios = useApi();
  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para buscar coordinadores
  const fetchCoordinadores = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = "/coordinadores";
      const respuesta = await axios.get(endpoint);
      console.log("Respuesta de coordinadores:", respuesta);
      setCoordinadores(respuesta.coordinadores || []);
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
