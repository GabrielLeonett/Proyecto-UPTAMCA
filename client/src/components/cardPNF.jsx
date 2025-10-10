import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";

export default function CardPNF({ pnf }) {
  useEffect(() => {
    console.log(pnf);
  }, [pnf]);
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component="div"
      id={pnf.codigo}
      onClick={() => {
        navigate(`/formacion/programas/${pnf.codigo}`, {
          state: { PNF: pnf.name },
        });
      }}
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
          fontWeight: "bold",
          color: theme.palette.primary.main,
        }}
      >
        {pnf.name}
      </Typography>
      <Typography
        component="p"
        variant="body1"
        gutterBottom
        color={theme.palette.secondary.main}
      >
        Codigo: {pnf.codigo}
      </Typography>
      <Typography
        component="p"
        variant="body1"
        gutterBottom
        color={theme.palette.secondary.main}
      >
        Poblacion Estudiantil: {pnf?.poblacion || 0}
      </Typography>

      <Typography variant="body2" sx={{ fontSize: 15 }} color="text.secondary">
        {pnf.descripcion || "Descripción no disponible"}
      </Typography>
    </Box>
  );
}
