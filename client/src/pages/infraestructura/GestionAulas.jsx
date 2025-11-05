// src/pages/GestionAulas.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import ResponsiveAppBar from "../../components/navbar";
import CustomButton from "../../components/customButton";
import useApi from "../../hook/useApi";

export default function GestionAulas() {
  const theme = useTheme();
  const axios = useApi();
  const navigate = useNavigate();
  const parametros = useParams();
  const { id_sede } = parametros;

  const [aulas, setAulas] = useState([]);
  const [filteredAulas, setFilteredAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Cargar aulas
  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const response = await axios.get(`/aulas/sede/${id_sede}`);
        const data = response.aulas || [];
        setAulas(data);
        setFilteredAulas(data);
      } catch (error) {
        console.error("❌ Error al obtener aulas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAulas();
  }, []);

  // Buscar aulas
  const handleSearch = (value) => {
    setSearch(value);
    const filtered = aulas.filter(
      (aula) =>
        aula.codigo?.toLowerCase().includes(value.toLowerCase()) ||
        aula.tipo?.toLowerCase().includes(value.toLowerCase()) ||
        aula.sede?.nombre_sede?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAulas(filtered);
  };

  // Eliminar aula
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta aula?")) return;
    try {
      await axios.delete(`/Aula/delete/${id}`);
      setAulas(aula.filter((a) => a.id_aula !== id));
      setFilteredAulas(filteredAulas.filter((a) => a.id_aula !== id));
    } catch (error) {
      console.error("❌ Error al eliminar aula:", error);
    }
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen p-6"
        sx={{ mt: 10, backgroundColor: theme.palette.background.default }}
      >
        <Box
          className="flex justify-between items-center mb-4"
          sx={{ flexWrap: "wrap", gap: 2 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={theme.palette.primary.main}
          >
            Gestión de Aulas
          </Typography>

          <CustomButton
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate("/infraestructura/aulas/registrar")}
          >
            Registrar Aula
          </CustomButton>
        </Box>

        <Box
          className="flex items-center mb-4"
          sx={{ gap: 1, width: "100%", maxWidth: 400 }}
        >
          <Search color="action" />
          <TextField
            fullWidth
            size="small"
            label="Buscar aula..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Box>

        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <CircularProgress />
          </Box>
        ) : filteredAulas.length === 0 ? (
          <Typography align="center" variant="h6" sx={{ mt: 4 }}>
            No se encontraron aulas registradas.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "16px",
              boxShadow: theme.shadows[4],
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                    Código
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                    Capacidad
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                    Sede
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAulas.map((aula) => (
                  <TableRow key={aula.id_aula}>
                    <TableCell>{aula.codigo}</TableCell>
                    <TableCell>{aula.tipo}</TableCell>
                    <TableCell>{aula.capacidad}</TableCell>
                    <TableCell>
                      {aula.sede?.nombre_sede || "Sin asignar"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/aulas/editar/${aulas.id_aula}`)
                          }
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(aulas.id_aula)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}
