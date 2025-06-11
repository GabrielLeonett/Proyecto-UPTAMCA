import { Typography, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';

export default function CardPNF({ pnf }) {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 3,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 6,
          borderColor: theme.palette.primary.dark,
        },
      }}
      component="div"
      id={pnf.codigo} // Usar código en lugar de id si no existe id
    >
      <Typography 
        component="h2" 
        variant="h6" 
        color={theme.palette.primary.main} 
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {pnf.name} - {pnf.codigo}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Población estudiantil: {pnf.poblacion}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {pnf.descripcion || "Descripción no disponible"}
      </Typography>
    </Box>
  );
}