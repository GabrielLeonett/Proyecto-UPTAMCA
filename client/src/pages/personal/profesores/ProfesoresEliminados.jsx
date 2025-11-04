import ResponsiveAppBar from "../../../components/navbar";
import {
  Typography,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../../hook/useApi";
import CardProfesorEliminado from "../../../components/CardProfesorEliminado";

export default function ProfesoresEliminados() {
  const [profesores, setProfesores] = useState([]);
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const axios = useApi();
  const theme = useTheme();

  const fetchEliminados = useCallback(async () => {
    setLoading(true);
    try {
      const { profesoresEliminados } = await axios.get("/profesores/eliminados");
      setProfesores(profesoresEliminados || []);
      setProfesoresFiltrados(profesoresEliminados || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchEliminados();
  }, [fetchEliminados]);

  const handleBuscar = (e) => {
    const valor = e.target.value.toLowerCase();
    setBusqueda(valor);

    if (valor === "") {
      setProfesoresFiltrados(profesores);
    } else {
      const filtrados = profesores.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(valor) ||
          p.cedula?.toLowerCase().includes(valor)
      );
      setProfesoresFiltrados(filtrados);
    }
  };

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
        <Typography variant="h2" component="h2" sx={{ px: 2 }}>
          Profesores Eliminados
        </Typography>

        {/* 🔍 Barra de búsqueda */}
        <Box sx={{ maxWidth: 400, px: 2, mt: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar profesor por nombre o cédula..."
            value={busqueda}
            onChange={handleBuscar}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        ) : profesoresFiltrados.length === 0 ? (
          <Typography sx={{ px: 2, mt: 3 }}>
            No hay profesores eliminados que coincidan con la búsqueda.
          </Typography>
        ) : (
          <Stack spacing={2} mt={3} sx={{ px: 2 }}>
            {profesoresFiltrados.map((prof) => (
              <CardProfesorEliminado key={prof.id} prof={prof} />
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
