import { useTheme } from "@mui/material";
import { Box, Typography } from "@mui/material";

export default function Clase({ profesor, unidad_curricular }) {
    const theme = useTheme();
  return (
    <>
    <Box sx={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: theme.palette.background.default }}>
        <Typography variant="h4" color={theme.palette.primary.main} sx={{ textAlign: "center" }}>
            {profesor}
        </Typography>
        <Typography variant="h4" color={theme.palette.primary.main} sx={{ textAlign: "center" }}>
            {unidad_curricular}
        </Typography>
    </Box>
    </>
  );
}
