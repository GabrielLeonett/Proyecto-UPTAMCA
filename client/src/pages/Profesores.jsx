import ResponsiveAppBar from "../components/navbar";
import CustomToggleButtons from "../components/customChechBox";
import CardProfesor from "../components/cardProfesor";
import { Typography, Box, Grid } from "@mui/material";
import CustomLabel from "../components/customLabel";
import { useState, useEffect } from "react";
import axios from "../apis/axios";

export default function Profesores() {
  async function AxiosProfesor() {
    try {
      const response = await axios.get("/Profesor");
      return response.data.data; // Asegúrate de acceder a response.data en lugar de imprimir el objeto completo
    } catch (error) {
      console.error("Error al obtener los datos de los profesores:", error);
    }
  }

  const [Profesores, setProfesores] = useState([]);

  useEffect(() => {
    async function fetchProfesores() {
      try {
        const data = await AxiosProfesor();
        console.log(data)
        setProfesores(data || []);
      } catch (error) {
        console.error("Error cargando los profesores:", error);
      }
    }
    fetchProfesores();
  }, []);

  const [dedicacionFilter, setDedicacionFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [ubicacionFilter, setUbicacionFilter] = useState("");
  const [generoFilter, setGeneroFilter] = useState("");

  const dedicacionOptions = [
    { value: "Convencional", label: "Convencional" },
    { value: "Tiempo Completo", label: "Tiempo Completo" },
    { value: "Medio Tiempo", label: "Medio Tiempo" },
    { value: "Exclusivo", label: "Exclusivo" },
  ];

  const categoriaOptions = [
    { value: "Instructor", label: "Instructor" },
    { value: "Asistente", label: "Asistente" },
    { value: "Asociado", label: "Asociado" },
    { value: "Agregado", label: "Agregado" },
    { value: "Titular", label: "Titular" },
  ];

  const ubicacionOptions = [
    { value: "Núcleo de Salud y Deporte", label: "Núcleo de Salud y Deporte" },
    {
      value: "Núcleo de Tecnología y Ciencias Administrativas",
      label: "Núcleo de Tecnología y Ciencias Administrativas",
    },
    {
      value: "Núcleo de Humanidades y Ciencias Sociales",
      label: "Núcleo de Humanidades y Ciencias Sociales",
    },
  ];
  const generoOptions = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
  ];

  // Función que se ejecuta cuando cambia el filtro
  const handleDedicacionChange = (newValue) => {
    setDedicacionFilter(newValue);
  };
  const handleCategoriaChange = (newValue) => {
    setCategoriaFilter(newValue);
  };
  const handleUbicacionChange = (newValue) => {
    setUbicacionFilter(newValue);
  };
  const handleGeneroChange = (newValue) => {
    setGeneroFilter(newValue);
  };

  return (
    <>
      <ResponsiveAppBar
        pages={["registerProfesor", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />
      <br />
      <br />
      <br />
      <br />
      <Box>
        <Typography variant="h2" component="h2" margin={5} gutterBottom>
          Profesores
        </Typography>

        <Grid container spacing={8} margin={5}>
          <Grid size={3}>
            <Box>
              <Box>
                <Typography variant="subtitle2" component="p" gutterBottom>
                  Dedicación
                </Typography>
                <Box>
                  <CustomToggleButtons
                    options={dedicacionOptions}
                    value={dedicacionFilter}
                    onChange={handleDedicacionChange}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="p" gutterBottom>
                  Categoría
                </Typography>
                <Box>
                  <CustomToggleButtons
                    options={categoriaOptions}
                    value={categoriaFilter}
                    onChange={handleCategoriaChange}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="p" gutterBottom>
                  Ubicación
                </Typography>
                <Box>
                  <CustomToggleButtons
                    options={ubicacionOptions}
                    value={ubicacionFilter}
                    onChange={handleUbicacionChange}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" component="p" gutterBottom>
                  Genero
                </Typography>
                <Box>
                  <CustomToggleButtons
                    options={generoOptions}
                    value={generoFilter}
                    onChange={handleGeneroChange}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={9}>
            <CustomLabel
              id="busqueda"
              name="busqueda"
              label="Buscar Profesor"
              type="text"
              variant="outlined"
              helperText="Buscar Profesor por: Nombre, Apellido o Cedula"
              fullWidth
            />
            <Box>
                <CardProfesor profesor={Profesores[0]} />;
                <CardProfesor profesor={Profesores[1]} />;
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
