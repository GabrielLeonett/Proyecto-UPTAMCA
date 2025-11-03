import ResponsiveAppBar from "../../components/navbar";
import CardProfesor from "../../components/cardProfesor";
import { Typography, Box, Grid, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hook/useApi";
import { useParams } from "react-router-dom";

export default function GestionProfesores() {
  const axios = useApi(false);

  const [profesores, setProfesores] = useState([]);
  const [profesorEspecifico, setProfesorEspecifico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { id_profesor } = params;

  // Función para buscar profesores - MEJORADA
  const fetchProfesores = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProfesorEspecifico(null); // Resetear profesor específico
    
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
          profesor => profesor.cedula === id_profesor || profesor.id === id_profesor
        );

        if (profesorEncontrado) {
          console.log("✅ Profesor específico encontrado:", profesorEncontrado);
          setProfesorEspecifico(profesorEncontrado);
          
          // Filtrar los demás profesores (excluir el específico)
          const otrosProfesores = profesoresData.filter(
            profesor => profesor.cedula !== id_profesor && profesor.id !== id_profesor
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
      setError("Error al cargar los profesores");
      setProfesores([]);
    } finally {
      setLoading(false);
    }
  }, [axios, id_profesor]); // ✅ Ahora incluye id_profesor como dependencia

  // Efecto inicial para cargar profesores
  useEffect(() => {
    fetchProfesores();
  }, [fetchProfesores]); // ✅ Ahora depende de fetchProfesores

  // Debug: ver qué está pasando
  useEffect(() => {
    console.log("📈 Estado actual:", {
      loading,
      error: error?.substring(0, 50) + "...",
      cantidadProfesores: profesores.length,
      profesorEspecifico: !!profesorEspecifico,
      id_profesor,
    });
  }, [loading, error, profesores.length, profesorEspecifico, id_profesor]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: { xs: 2, sm: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Profesores
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando profesores...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" my={4}>
            {error}
          </Typography>
        ) : (
          <>
            {/* SECCIÓN DEL PROFESOR ESPECÍFICO (si existe) */}
            {profesorEspecifico && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: "primary.main" }}>
                  Profesor Seleccionado
                </Typography>
                <Grid container spacing={3}>
                  <Grid item>
                    <CardProfesor 
                      profesor={profesorEspecifico} 
                      isSearch={true}
                      highlight={true} // Puedes agregar esta prop para destacarlo
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* SECCIÓN DE LOS DEMÁS PROFESORES */}
            {(profesores.length > 0 || !profesorEspecifico) && (
              <Box>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                  {profesorEspecifico ? "Otros Profesores" : "Todos los Profesores"}
                </Typography>
                
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
          </>
        )}
      </Box>
    </>
  );
}