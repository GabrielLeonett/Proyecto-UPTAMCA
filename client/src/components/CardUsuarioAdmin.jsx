import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import useApi from "../hook/useApi";

export default function CardUsuarioAdmin({ usuario }) {
  const axios = useApi(false);
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Cargar imagen del usuario (si existe)
  useEffect(() => {
    const loadUserImage = async () => {
      if (!usuario?.cedula) return;
      try {
        const response = await axios.get(`/usuarios/${usuario.cedula}/imagen`, {
          responseType: "blob",
        });
        const imageUrl = URL.createObjectURL(response.data);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.warn("Sin imagen, usando iniciales.");
      }
    };
    loadUserImage();
  }, [usuario?.cedula, axios]);

  // Iniciales si no hay imagen
  const getInitials = () => {
    const first = usuario?.nombres?.charAt(0) || "N";
    const last = usuario?.apellidos?.charAt(0) || "A";
    return `${first}${last}`;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 3,
        p: 2,
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {/* Avatar */}
      <Avatar
        src={avatarUrl || undefined}
        alt={`${usuario?.nombres} ${usuario?.apellidos}`}
        sx={{
          width: 80,
          height: 80,
          fontSize: "1.8rem",
          bgcolor: theme.palette.primary.main,
          color: "white",
        }}
      >
        {!avatarUrl && getInitials()}
      </Avatar>

      {/* Información del usuario */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {usuario?.nombres || "Nombre"} {usuario?.apellidos || "Apellido"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Cédula:</strong> {usuario?.cedula || "No especificada"}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Rol(es):
        </Typography>

        {usuario?.roles && usuario.roles.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
            {usuario.roles.map((rol, index) => (
              <Chip
                key={index}
                label={rol}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No tiene roles asignados
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
