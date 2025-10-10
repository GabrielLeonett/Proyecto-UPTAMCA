// src/pages/ViewSede.jsx
import { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress, Card, CardContent, CardActions, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../components/navbar";
import axios from "../apis/axios";
import { MapPin, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ViewSede() {
  const theme = useTheme();

  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 👉 Cargar las sedes al montar
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get("/Sedes"); // 👈 endpoint que lista las sedes
        console.log(response);
        setSedes(response.data.data);
      } catch (err) {
        console.error("Error al obtener las sedes:", err);
        setError("No se pudieron cargar las sedes.");
      } finally {
        setLoading(false);
      }
    };
    fetchSedes();
  }, []);

  // 👉 Eliminar sede
  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/Sede/delete/${id}`);
          setSedes((prev) => prev.filter((sede) => sede.id !== id));
          Swal.fire("Eliminada", "La sede ha sido eliminada.", "success");
        } catch (err) {
          console.error("Error al eliminar la sede:", err);
          Swal.fire("Error", "No se pudo eliminar la sede.", "error");
        }
      }
    });
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen p-6"
        sx={{
          mt: 10,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ mb: 4, textAlign: "center" }}
        >
          Lista de Sedes
        </Typography>

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

        {/* 👉 Grid de Sedes */}
        {!loading && !error && (
          <Grid container spacing={4}>
            {sedes.length > 0 ? (
              sedes.map((sede) => (
                <Grid key={sede.id || sede.id_sede} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      borderRadius: "20px",
                      boxShadow: theme.shadows[6],
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" fontWeight="bold">
                        {sede.nombre_sede}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        📍 {sede.ubicacion_sede}
                      </Typography>
                      {sede.google_sede && (
                        <a
                          href={sede.google_sede}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 mt-2"
                        >
                          <MapPin size={18} className="mr-1" /> Ver en Google Maps
                        </a>
                      )}
                    </CardContent>
                    <CardActions className="flex justify-end">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(sede.id || sede.id_sede)}
                      >
                        <Trash2 />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="h6" align="center" sx={{ width: "100%", mt: 4 }}>
                No hay sedes registradas todavía.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </>
  );
}
