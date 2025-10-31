import ResponsiveAppBar from "../../components/navbar";
import {
  Typography,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi";
import CardProfesorEliminado from "../../components/CardProfesorEliminado";
export default function ProfesoresEliminados() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const axios = useApi();
  const theme = useTheme();

  const fetchEliminados = useCallback(async () => {
    setLoading(true);
    try {
      const { profesoresEliminados } = await axios.get(
        "/profesores/eliminados"
      );
      console.log(profesoresEliminados);
      setProfesores(profesoresEliminados || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchEliminados();
  }, [fetchEliminados]);

  return (
    <>
      <ResponsiveAppBar backgroundColor={true} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Typography variant="h2" component={"h2"} sx={{ px: 2 }}>
          Profesores Eliminados
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        ) : profesores.length === 0 ? (
          <Typography>No hay profesores eliminados actualmente.</Typography>
        ) : (
          <Stack spacing={2} mt={3} sx={{ px: 2 }}>
            {profesores.map((prof) => (
              <CardProfesorEliminado prof={prof} />
            ))}
          </Stack>
        )}

        <Snackbar
          open={!!mensaje}
          autoHideDuration={3000}
          onClose={() => setMensaje(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setMensaje(null)}
          >
            {mensaje}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
