import { Typography, Box } from "@mui/material";
import {useTheme} from '@mui/material/styles'

export default function CardPNF({ pnf }) {
    const theme = useTheme();
  return (
    <Box sx={{
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 3,
        transition: "transform 0.3s",
        "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 6,
        },
    }}>
        <Typography component="h2" variant="h6" color={theme.palette.primary.main} gutterBottom>
            {pnf.name} - {pnf.codigo}
        </Typography>
        <Typography variant="body1" color="textSecondary">
            {pnf.poblacion} Estudiantes
        </Typography>
        <Typography variant="body2" color="textSecondary">
            {pnf.descripcion || "Descripción no disponible"}
        </Typography>
    </Box>
  );
}