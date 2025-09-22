import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../components/navbar";
import {
  Box,
  CircularProgress,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import CardTrayecto from "../components/cardTrayecto";
import axios from "../apis/axios";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PNF() {
  const { codigoPNF } = useParams();
  const navigate = useNavigate(); // ← Agregar useNavigate
  const [trayectos, setTrayectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pedirTrayectos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/Trayectos?PNF=${codigoPNF}`);
        setTrayectos(res.data.data);
      } catch (error) {
        console.error("Error fetching trayectos:", error);
        setError("Error al cargar los trayectos");
      } finally {
        setLoading(false);
      }
    };

    pedirTrayectos();
  }, [codigoPNF]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: 5 }}>
        <Box sx={{ mt: 5 }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => navigate("/PNFS")} // ← Agregar onClick
            >
              PNFS
            </Link>

            <Link component="button" underline="hover" color="inherit" disabled>
              {codigoPNF}
            </Link>
          </Breadcrumbs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : trayectos.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron trayectos para este PNF
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {trayectos.map((trayecto) => (
              <Grid item xs={12} sm={6} md={4} key={trayecto.id}>
                <CardTrayecto Trayecto={trayecto} codigoPNF={codigoPNF} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}
