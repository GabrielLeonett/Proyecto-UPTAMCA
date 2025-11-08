import { Typography, Box, Grid, Tooltip } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../../hook/useApi";
import { useNavigate, useParams } from "react-router-dom";
import ResponsiveAppBar from "../../../components/navbar";
import CardProfesor from "../../../components/cardProfesor";
import SkeletonProfesores from "../../../components/SkeletonProfesores";
import CustomButton from "../../../components/customButton";

export default function GestionProfesores() {
  const axios = useApi(false);
  const navigate = useNavigate();

  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id_profesor } = useParams();

  // Función para buscar profesores - MEJORADA
  const fetchProfesores = useCallback(async () => {
    setLoading(true);

    try {
      const endpoint = "/profesores";
      const data = await axios.get(endpoint);
      console.log("🔍 Profesores obtenidos:", data);

      let profesoresData = data.profesores || [];

      // Si hay un id_profesor, buscar y separar ese profesor
      if (id_profesor) {
        console.log("🎯 Buscando profesor específico:", id_profesor);

        // Buscar el profesor específico
        const profesorEncontrado = profesoresData.find(
          (profesor) =>
            profesor.cedula === id_profesor || profesor.id === id_profesor
        );

        if (profesorEncontrado) {
          console.log("✅ Profesor específico encontrado:", profesorEncontrado);

          // Filtrar los demás profesores (excluir el específico)
          const otrosProfesores = profesoresData.filter(
            (profesor) =>
              profesor.cedula !== id_profesor && profesor.id !== id_profesor
          );
          setProfesores(otrosProfesores);
        } else {
          console.log("❌ Profesor específico NO encontrado");
          setProfesores(profesoresData); // Mostrar todos si no se encuentra
        }
      } else {
        // Si no hay id_profesor, mostrar todos los profesores
        setProfesores(profesoresData);
      }
    } catch (err) {
      console.error("❌ Error cargando profesores:", err);
      setProfesores([]);
    } finally {
      setLoading(false);
    }
  }, [axios, id_profesor]);

  // Efecto inicial para cargar profesores
  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]); // ✅ Ahora depende de fetchProfesores

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box mt={12} p={3}>
        <Typography variant="h3" fontWeight={600} mb={1}>
          Gestión de Profesores
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Visualizar, Editar y Crear Profesores
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SkeletonProfesores />
            <SkeletonProfesores />
            <SkeletonProfesores />
          </Box>
        ) : (
          <Box>
            {profesores.length === 0 ? (
              <Typography textAlign="center" my={4}>
                No hay más profesores registrados
              </Typography>
            ) : (
              <Grid
                container
                spacing={3}
                sx={{
                  width: "100%",
                  margin: 0,
                }}
              >
                {profesores.map((profesor) => (
                  <Grid item key={profesor.cedula || profesor.id}>
                    <CardProfesor
                      profesor={profesor}
                      isSearch={!!id_profesor}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        <Tooltip title={"Registrar Profesor"} placement="left-start">
          <CustomButton
            onClick={() => {
              navigate("/academico/profesores/registrar");
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
            aria-label={"Registrar Profesor"}
          >
            <PersonAddIcon />
          </CustomButton>
        </Tooltip>
      </Box>
    </>
  );
}
