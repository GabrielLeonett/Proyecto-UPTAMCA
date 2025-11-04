// src/pages/ViewSede.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../../components/navbar";
import useApi from "../../hook/useApi";
import CardSede from "../../components/CardSede";
import CustomButton from "../../components/customButton";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

export default function GestionSedes() {
  const theme = useTheme();
  const axios = useApi();
  const navigate = useNavigate();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 👉 Cargar sedes
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get("/sedes");
        console.log(response.sedes);
        setSedes(response.sedes || []);
      } catch (err) {
        console.error("Error al obtener las sedes:", err);
        setError("No se pudieron cargar las sedes.");
      } finally {
        setLoading(false);
      }
    };
    fetchSedes();
  }, [axios]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box
        sx={{
          mt: 12,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Encabezado */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
            }}
          >
            Sedes
          </Typography>
        </Box>

        {/* 👉 Loading */}
        {loading && (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        )}

        {/* 👉 Error */}
        {error && (
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        )}

        {/* 👉 Grid de sedes */}
        {!loading && !error && (
          <Grid container spacing={4}>
            {sedes.length > 0 ? (
              sedes.map((sede) => <CardSede sede={sede} />)
            ) : (
              <Typography
                variant="h6"
                align="center"
                sx={{ width: "100%", mt: 4 }}
              >
                No hay sedes registradas todavía.
              </Typography>
            )}
          </Grid>
        )}
        <Tooltip title={"Crear Sede"} placement="left-start">
          <CustomButton
            onClick={() => {
              navigate("/infraestructura/sedes/registrar");
            }}
            sx={{
              position: "fixed",
              bottom: 78,
              right: 24,
              minWidth: "auto",
              width: 48,
              height: 48,
              borderRadius: "50%",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={"Crear Sede"}
          >
            <AddIcon />
          </CustomButton>
        </Tooltip>
      </Box>
    </>
  );
}
