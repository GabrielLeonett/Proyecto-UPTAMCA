import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  useTheme,
} from "@mui/material";
import CustomButton from "../components/customButton";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";

const Miuser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Función para obtener color del rol
  const getRoleColor = (role) => {
    const colors = {
      Profesor: "primary",
      Coordinador: "secondary",
      "Director General de Gestión Curricular": "success",
      Vicerrector: "warning",
      SuperAdmin: "error",
    };
    return colors[role] || "default";
  };

  // Componente de botón de acción mejorado
  const ActionButton = ({ label, onClick, color = "primary" }) => (
    <CustomButton
      variant="outlined"
      onClick={onClick}
      fullWidth
      sx={{
        justifyContent: "flex-start",
        py: 1.5,
        px: 2,
        mb: 1,
        borderColor: theme.palette[color]?.main || theme.palette.primary.main,
        color: theme.palette[color]?.main || theme.palette.primary.main,
        "&:hover": {
          backgroundColor: theme.palette[color]?.light + "20",
          borderColor: theme.palette[color]?.main,
        },
      }}
    >
      {label}
    </CustomButton>
  );

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography variant="h6" color="textSecondary">
          Cargando perfil...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar backgroundColor />
      <Container maxWidth="lg" sx={{ py: 4, mt: 10 }}>
        {/* Header del perfil */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            borderRadius: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "white",
                color: theme.palette.primary.main,
                fontSize: "2rem",
                border: "3px solid white",
              }}
            >
              {user.nombres?.[0]}
              {user.apellidos?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user.nombres} {user.apellidos}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }} gutterBottom>
                {user.correo}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {user.roles?.map((role, index) => (
                  <Chip
                    key={index}
                    label={role.trim()}
                    color={getRoleColor(role.trim())}
                    variant="filled"
                    sx={{ color: "white", fontWeight: "bold" }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Panel de acciones según rol */}
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                >
                  Acciones Disponibles
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  {/* Profesor */}
                  {user.roles?.includes("Profesor") && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Profesor
                      </Typography>
                      <ActionButton
                        label="Ver Horario"
                        onClick={() => navigate("/horario-profesor")}
                      />
                      <ActionButton
                        label="Datos Personales"
                        onClick={() => navigate("/datos-personales")}
                      />
                      <ActionButton
                        label="Carga Académica"
                        onClick={() => navigate("/carga-academica")}
                      />
                      <ActionButton
                        label="Notificaciones"
                        onClick={() => navigate("/notificaciones")}
                      />
                      <ActionButton
                        label="Tickets"
                        onClick={() => navigate("/tickets")}
                      />
                      <ActionButton
                        label="Registrar Disponibilidad"
                        onClick={() => navigate("/registrar-disponibilidad")}
                      />
                    </Grid>
                  )}

                  {/* Coordinador */}
                  {user.roles?.includes("Coordinador") && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Coordinador
                      </Typography>
                      <ActionButton
                        label="Gestionar Horarios"
                        onClick={() => navigate("/gestion-horarios")}
                        color="secondary"
                      />
                      <ActionButton
                        label="Asignar Profesores"
                        onClick={() => navigate("/asignar-profesores")}
                        color="secondary"
                      />
                      <ActionButton
                        label="Gestionar Profesores"
                        onClick={() => navigate("/eliminar-profesores")}
                        color="secondary"
                      />
                      <ActionButton
                        label="Disponibilidad"
                        onClick={() => navigate("/disponibilidad")}
                        color="secondary"
                      />
                    </Grid>
                  )}

                  {/* Director General */}
                  {user.roles?.includes(
                    "Director General de Gestión Curricular"
                  ) && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" color="success" gutterBottom>
                        Director General
                      </Typography>
                      <ActionButton
                        label="Supervisar Planificaciones"
                        onClick={() => navigate("/planificaciones")}
                        color="success"
                      />
                      <ActionButton
                        label="Gestionar Profesores"
                        onClick={() => navigate("/profesores")}
                        color="success"
                      />
                      <ActionButton
                        label="Ver Reportes"
                        onClick={() => navigate("/reportes")}
                        color="success"
                      />
                    </Grid>
                  )}

                  {/* Vicerrector */}
                  {user.roles?.includes("Vicerrector") && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" color="warning" gutterBottom>
                        Vicerrector
                      </Typography>
                      <ActionButton
                        label="Ver Indicadores"
                        onClick={() => navigate("/indicadores")}
                        color="warning"
                      />
                      <ActionButton
                        label="Gestionar Profesores"
                        onClick={() => navigate("/eliminar-profesores")}
                        color="warning"
                      />
                    </Grid>
                  )}

                  {/* SuperAdmin */}
                  {user.roles?.includes("SuperAdmin") && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" color="error" gutterBottom>
                        Super Admin
                      </Typography>
                      <ActionButton
                        label="Administrar Usuarios"
                        onClick={() => navigate("/usuarios")}
                        color="error"
                      />
                      <ActionButton
                        label="Reportes Globales"
                        onClick={() => navigate("/reportes-globales")}
                        color="error"
                      />
                      <ActionButton
                        label="Panel de Control"
                        onClick={() => navigate("/admin")}
                        color="error"
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Panel de información adicional */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                >
                  Información del Sistema
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ spaceY: 2 }}>
                  <Box
                    sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Último acceso
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date().toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Estado de la cuenta
                    </Typography>
                    <Chip label="Activa" color="success" size="small" />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Configuración
                    </Typography>
                    <CustomButton
                      variant="text"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => navigate("/configuracion")}
                    >
                      Editar preferencias
                    </CustomButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Miuser;
