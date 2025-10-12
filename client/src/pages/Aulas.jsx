// src/pages/ViewAula.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../components/navbar";
import useApi from "../hook/useApi"; // Added import for axios

export default function ViewAula() {
  const theme = useTheme();
  const axios = useApi();

  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const response = await axios.get("/Aula/all");
        setAulas(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAulas();
  }, []);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen p-6"
        sx={{ mt: 10, backgroundColor: theme.palette.background.default }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          Lista de Aulas
        </Typography>

        {loading && (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Grid container spacing={4}>
            {aulas.length > 0 ? (
              aulas.map((aula) => (
                <Grid item xs={12} sm={6} md={4} key={aula.id}>
                  <Card
                    sx={{ borderRadius: "20px", boxShadow: theme.shadows[6] }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        Código: {aula.codigo}
                      </Typography>
                      <Typography variant="body1">Tipo: {aula.tipo}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sede: {aula.sede?.nombreSede || "Sin asignar"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography
                variant="h6"
                align="center"
                sx={{ width: "100%", mt: 4 }}
              >
                No hay aulas registradas todavía.
              </Typography>
            )}
          </Grid>
        )}
      </Box>
    </>
  );
}
