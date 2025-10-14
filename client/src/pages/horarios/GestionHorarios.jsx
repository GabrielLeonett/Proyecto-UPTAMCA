import { useEffect, useState } from "react";
import Horario from "../../components/Horario";
import ResponsiveAppBar from "../../components/navbar";
import { Box, CircularProgress, Typography } from "@mui/material";
import useApi from "../../hook/useApi"; // Added import for axios

export default function GestionHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axios = useApi();

  useEffect(() => {
    const getHorarios = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/Horarios");
        setHorarios(data || []);
      } catch (err) {
        console.error("Error al obtener horarios:", err);
        setError("Error al cargar los horarios");
      } finally {
        setLoading(false);
      }
    };
    getHorarios();
  }, []);

  if (loading) {
    return (
      <>
        <ResponsiveAppBar backgroundColor={true} />
        <Box
          marginTop={"200px"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} textAlign={"start"} width={"100%"}>
            Horarios
          </Typography>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ResponsiveAppBar backgroundColor={true} />
        <Box
          marginTop={"200px"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} textAlign={"start"} width={"100%"}>
            Horarios
          </Typography>
          <Typography color="error">{error}</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <ResponsiveAppBar backgroundColor={true} />
      <Box
        marginTop={"120px"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyItems={"center"}
        gap={4}
        p={3}
        width={"100%"}
      >
        <Typography variant={"h2"} textAlign={"start"} width={"100%"}>
          Horarios
        </Typography>
        {horarios && horarios.length > 0 ? (
          horarios.map((horario, index) => (
            <Horario
              key={index}
              PNF={horario.pnf}
              Turno={horario.turno}
              Trayecto={horario.trayecto}
              Seccion={{
                seccion: horario.seccion,
                idSeccion: horario.idSeccion,
              }}
              Horario={horario.dias}
            />
          ))
        ) : (
          <Typography variant="h6" color="textSecondary">
            No hay horarios disponibles
          </Typography>
        )}
      </Box>
    </>
  );
}
