import { Typography, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';

export default function CardSeccion({ seccion }) {
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
    >
      <Typography 
        component="h2" 
        variant="h6" 
        color={theme.palette.primary.main} 
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {seccion.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Estudiantes de la Seccion: {seccion.estudiantes}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Turno: {seccion.turno}
      </Typography>
    </Box>
  );
}