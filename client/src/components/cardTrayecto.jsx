import { Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // ✅ corregido

export default function CardTrayecto({ Trayecto, codigoPNF }) {
  const theme = useTheme();
  const navigate = useNavigate(); // ✅ función de navegación

  return (
    <Grid
      key={Trayecto?.id_trayecto}
      sx={{
        maxWidth: "1100px",
        width: "100%",
        mx: "auto",
        mt: 5,
        p: 4,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 5,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 8,
          transform: "scale(1.01)",
          borderColor: theme.palette.primary.main,
        },
      }}
      onClick={() => {
        navigate(`/formacion/programas/${codigoPNF}/${Trayecto?.id_trayecto}`);
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
        Población estudiantil: {Trayecto?.poblacion_estudiantil || 0}
      </Typography>
    </Grid>
  );
}
