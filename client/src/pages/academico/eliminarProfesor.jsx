import ResponsiveAppBar from "../../components/navbar";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Stack,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import useApi from "../../hook/useApi";

export default function ProfesoresEliminados() {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
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
    try {
      await axios.put(`/Profesor/restaurar/${id}`);
      setMensaje("Profesor restaurado correctamente");
      fetchEliminados();
    } catch (error) {
      console.error("Error al restaurar:", error);
      setMensaje("Hubo un error al restaurar el profesor");
    }
  };

  useEffect(() => {
    fetchEliminados();
  }, []);

  return (
    <>
      <ResponsiveAppBar />
      <Box
        sx={{
          pt: 15,
          px: 5,
          minHeight: "100vh",
          backgroundColor: "#f7f9fc",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          color="primary"
        >
          Profesores Eliminados
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        ) : profesores.length === 0 ? (
          <Typography textAlign="center" my={6} color="text.secondary">
            No hay profesores eliminados actualmente.
          </Typography>
        ) : (
          <Stack spacing={2} mt={3}>
            {profesores.map((prof, index) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6">
                    {prof.nombres} {prof.apellidos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Motivo de eliminación:</strong>{" "}
                    {prof.motivo_eliminacion || "No especificado"}
                  </Typography>

                  <Stack direction="row" spacing={2} mt={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleRestaurar(prof.id)}
                    >
                      Restaurar
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
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
