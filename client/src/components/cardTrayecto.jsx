import { Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";

export default function CardTrayecto({ Trayecto }) {
  const theme = useTheme();
  useEffect(() => {
    console.log(Trayecto);
  }, [Trayecto]);
  return (
    <Grid
      key={Trayecto.id_trayecto}
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
        Trayecto: {Trayecto?.valor_trayecto || "Valor del trayecto"}
      </Typography>

      <Typography variant="body2" sx={{ fontSize: 15 }} color="text.secondary">
        {Trayecto?.poblacion_estudiantil || 0}
      </Typography>
    </Grid>
  );
}
