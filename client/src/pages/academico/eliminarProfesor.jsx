import ResponsiveAppBar from "../../components/navbar";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import useApi from "../../hook/useApi"; // Added import for axios

export default function ProfesoresEliminados() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const axios = useApi();

  const fetchEliminados = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/Profesor/eliminados");
      setProfesores(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurar = async (id) => {
    await axios.put(`/Profesor/restaurar/${id}`);
    fetchEliminados();
  };

  useEffect(() => {
    fetchEliminados();
  }, []);

  return (
    <>
      <ResponsiveAppBar backgroundColor />
      <Box sx={{ pt: 15, px: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Profesores Eliminados
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : profesores.length === 0 ? (
          <Typography textAlign="center" my={4}>
            No hay profesores eliminados
          </Typography>
        ) : (
          profesores.map((prof) => (
            <Box
              key={prof.id}
              sx={{ border: "1px solid #ccc", p: 2, borderRadius: 2, mb: 2 }}
            >
              <Typography>
                <strong>
                  {prof.nombres} {prof.apellidos}
                </strong>
              </Typography>
              <Typography>
                <strong>Motivo:</strong> {prof.motivo_eliminacion}
              </Typography>
              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => handleRestaurar(prof.id)}
                >
                  Restaurar
                </Button>
              </Stack>
            </Box>
          ))
        )}
      </Box>
    </>
  );
}
