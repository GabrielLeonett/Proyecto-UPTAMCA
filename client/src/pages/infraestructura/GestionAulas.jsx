// src/pages/ViewAula.jsx
import { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress, Card, CardContent, CardActions, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../../components/navbar";
import axios from "../../apis/axios";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function GestionAulas() {
  const theme = useTheme();
  const pages = [{ name: "Inicio", link: "/" }, { name: "Registrar Aula", link: "/register-aula" }];

  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const response = await axios.get("/Aula/all");
        setAulas(response.data);
      } catch (err) {
        setError("No se pudieron cargar las aulas.");
      } finally {
        setLoading(false);
      }
    };
    fetchAulas();
  }, []);

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
          await axios.delete(`/Aula/delete/${id}`);
          setAulas((prev) => prev.filter((aula) => aula.id !== id));
          Swal.fire("Eliminada", "El aula ha sido eliminada.", "success");
        } catch (err) {
          Swal.fire("Error", "No se pudo eliminar el aula.", "error");
        }
      }
    });
  };

  return (
    <>
      <ResponsiveAppBar pages={pages} backgroundColor />

      <Box className="flex flex-col w-full min-h-screen p-6" sx={{ mt: 10, backgroundColor: theme.palette.background.default }}>
        <Typography variant="h2" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
          Lista de Aulas
        </Typography>

        {loading && (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <Grid container spacing={4}>
            {aulas.length > 0 ? (
              aulas.map((aula) => (
                <Grid item xs={12} sm={6} md={4} key={aula.id}>
                  <Card sx={{ borderRadius: "20px", boxShadow: theme.shadows[6] }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        Código: {aula.codigo}
                      </Typography>
                      <Typography variant="body1">Tipo: {aula.tipo}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sede: {aula.sede?.nombreSede || "Sin asignar"}
                      </Typography>
                    </CardContent>
                    <CardActions className="flex justify-end">
                      <IconButton color="error" onClick={() => handleDelete(aula.id)}>
                        <Trash2 />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="h6" align="center" sx={{ width: "100%", mt: 4 }}>
                No hay aulas registradas todavía.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </>
  );
}
