import ResponsiveAppBar from "../components/navbar";
import { Typography, Box} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import CardPNF from "../components/cardPNF";

export default function PNF() {
  const theme = useTheme();
  
  return (
    <>
      <ResponsiveAppBar
        pages={["registerProfesor", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />
      
      <Box sx={{ pt: 12, px: 5 }}>
        <Typography component="h1" variant="h4" sx={{ mt: 4, mr: 4}}>
          Pogramas Nacionales de Formación (PNF)
        </Typography>

        <Box>
          <CardPNF pnf={{ name: "Ingeniería de Sistemas", codigo: "PNF", poblacion:300 }} />
        </Box>
      </Box>
    </>
  );
}