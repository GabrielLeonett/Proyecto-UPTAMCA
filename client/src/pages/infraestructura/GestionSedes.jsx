// src/pages/ViewSede.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../../components/navbar";
import useApi from "../../hook/useApi";
import { MapPin, Trash2 } from "lucide-react";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
        setSedes(response.sedes || []);

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
          await axios.delete(`/sede/delete/${id}`);
          setSedes((prev) => prev.filter((sede) => sede.id !== id));
          Swal.fire("Eliminada", "La sede ha sido eliminada.", "success");
        } catch (err) {
          console.error("Error al eliminar la sede:", err);
          Swal.fire("Error", "No se pudo eliminar la sede.", "error");
        }
      }
    });
  };

  // 👉 Redirigir a registrar sede
  const handleAddSede = () => {
    navigate("/infraestructura/sedes/registrar");
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
        {/* Encabezado */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
            }}
          >
            Lista de Sedes
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
              sedes.map((sede) => (
                <Grid
                  key={sede.id || sede.id_sede}
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={5}
                >
                  {/* Contenedor card + botón */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Card de sede */}
                    <Card
                      sx={{
                        borderRadius: "20px",
                        boxShadow: theme.shadows[6],
                        backgroundColor: "#1e1e1e",
                        color: "white",
                        flex: 1,
                        p: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5" fontWeight="bold">
                          {sede.nombre_sede}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          📍 {sede.ubicacion_sede}
                        </Typography>
                        {sede.google_sede && (
                          <a
                            href={sede.google_sede}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 mt-2"
                          >
                            <MapPin size={18} className="mr-1" /> Ver en Google
                            Maps
                          </a>
                        )}
                      </CardContent>
                      <CardActions className="flex justify-end">
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDelete(sede.id || sede.id_sede)
                          }
                        >
                          <Trash2 />
                        </IconButton>
                      </CardActions>
                    </Card>

                    {/* Botón al lado */}
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddSede}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        "&:hover": { backgroundColor: "#1565c0" },
                        height: "fit-content",
                      }}
                    >
                      Registrar Sede
                    </Button>
                  </Box>
                </Grid>
              ))
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
      </Box>
    </>
  );
}
