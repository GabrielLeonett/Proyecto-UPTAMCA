import { Box, Typography, Container } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ResponsiveAppBar from "../../components/navbar";

export default function PanelAdministracion() {
  const theme = useTheme();
  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Container maxWidth="lg" sx={{ mt: 15, mb: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Panel de Administración
          </Typography>
        </Box>
      </Container>
    </>
  );
}
