import { Typography, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';

export default function CardPNF({ pnf }) {
  const theme = useTheme();

  return (
    <Box
      component="div"
      id={pnf.codigo}
      sx={{
        maxWidth: "1100px",
        width: "100%",
        mx: "auto", // centrar horizontalmente
        mt: 5,
        p: 4, // padding interno
        borderRadius: 4, // redondeo moderno
        backgroundColor: theme.palette.background.paper,
        boxShadow: 5, // sombra elegante
        border: `1px solid ${theme.palette.divider}`, // borde sutil
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 8,
          transform: "scale(1.01)",
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Typography
        component="h2"
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: theme.palette.primary.main,
        }}
      >
        {pnf.name} - {pnf.codigo}
      </Typography>

      <Typography
        variant="body2"
        sx={{ fontSize: 15 }}
        color="text.secondary"
      >
        {pnf.descripcion || "Descripción no disponible"}
      </Typography>
    </Box>
  );
}
