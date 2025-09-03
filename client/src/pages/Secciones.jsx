import ResponsiveAppBar from "../components/navbar";
import CardSeccion from "../components/cardSeccion";
import { Box, Typography } from "@mui/material";

export default function Secciones() {
  const seccion = {
    name: "Seccion 01",
    estudiantes: "100",
    turno: "matutino",
  };
  return (
    <>
      <ResponsiveAppBar
        
        backgroundColor
      />
      <Box sx={{ pt: 12, px: 5 }}>
        <Typography component="h1" variant="h4" sx={{ mt: 4, mr: 4 }}>
          Secciones
        </Typography>

        {
          <Box>
            <CardSeccion
              key={1234556} // Asegúrate de tener una key única
              seccion={seccion}
            />
          </Box>
        }
      </Box>
    </>
  );
}
