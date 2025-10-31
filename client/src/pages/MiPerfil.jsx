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
  alpha,
  Fade,
} from "@mui/material";
import CustomButton from "../components/customButton";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Person,
  Schedule,
  Notifications,
  Assignment,
  AdminPanelSettings,
  Dashboard,
  BarChart,
  Groups,
  Settings,
  Security,
  School,
  SupervisorAccount,
  ManageAccounts,
  TrendingUp
} from "@mui/icons-material";

const Miuser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Todos los roles usan color primary (azul)
  const getRoleColor = (role) => 'primary';

  // Función para obtener icono según el rol
  const getRoleIcon = (role) => {
    const roleIcons = {
      'Profesor': <School />,
      'Coordinador': <SupervisorAccount />,
      'Director General de Gestión Curricular': <ManageAccounts />,
      'Vicerrector': <TrendingUp />,
      'SuperAdmin': <AdminPanelSettings />
    };
    return roleIcons[role] || <Person />;
  };

  const ActionButton = ({ label, onClick, icon }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <CustomButton
        variant="outlined"
        onClick={onClick}
        sx={{
          justifyContent: "flex-start",
          py: 1.5,
          px: 3,
          mb: 2,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "0.9rem",
          fontWeight: 500,
          color: theme.palette.primary.main,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderColor: theme.palette.primary.main,
            transform: "translateY(-1px)",
          },
          minWidth: '220px',
          width: '100%'
        }}
        startIcon={icon}
      >
        {label}
      </CustomButton>
    </motion.div>
  );

  const roleSections = {
    Profesor: {
      actions: [
        { label: "Ver Horario", path: "/horario-profesor", icon: <Schedule /> },
        { label: "Datos Personales", path: "/datos-personales", icon: <Person /> },
        { label: "Carga Académica", path: "/carga-academica", icon: <Assignment /> },
        { label: "Notificaciones", path: "/notificaciones", icon: <Notifications /> },
        { label: "Tickets", path: "/tickets", icon: <Assignment /> },
        { label: "Registrar Disponibilidad", path: "/academico/profesores/disponibilidad", icon: <Schedule /> },
      ]
    },
    Coordinador: {
      actions: [
        { label: "Gestionar Horarios", path: "/gestion-horarios", icon: <Schedule /> },
        { label: "Asignar Profesores", path: "/asignar-profesores", icon: <Groups /> },
        { label: "Gestionar Profesores", path: "/eliminar-profesores", icon: <Person /> },
        { label: "Disponibilidad", path: "/disponibilidad", icon: <Schedule /> },
      ]
    },
    "Director General de Gestión Curricular": {
      actions: [
        { label: "Supervisar Planificaciones", path: "/planificaciones", icon: <Dashboard /> },
        { label: "Gestionar Profesores", path: "/profesores", icon: <Groups /> },
        { label: "Ver Reportes", path: "/reportes", icon: <BarChart /> },
      ]
    },
    Vicerrector: {
      actions: [
        { label: "Ver Indicadores", path: "/indicadores", icon: <BarChart /> },
        { label: "Gestionar Profesores", path: "/eliminar-profesores", icon: <Groups /> },
      ]
    },
    SuperAdmin: {
      actions: [
        { label: "Administrar Usuarios", path: "/usuarios", icon: <AdminPanelSettings /> },
        { label: "Reportes Globales", path: "/reportes-globales", icon: <BarChart /> },
        { label: "Panel de Control", path: "/admin", icon: <Dashboard /> },
      ]
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6" color="textSecondary">
            Cargando perfil...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <>
      <Navbar backgroundColor />
      <Container maxWidth="xl" sx={{ py: 4, mt: 10 }}>
        {/* Header del perfil - diseño minimalista */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 6,
              backgroundColor: "white",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Box display="flex" alignItems="center" gap={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                }}
              >
                {user.nombres?.[0]}
                {user.apellidos?.[0]}
              </Avatar>
              
              <Box flex={1}>
                <Typography 
                  variant="h4" 
                  fontWeight="600" 
                  gutterBottom
                  color="primary"
                >
                  {user.nombres} {user.apellidos}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {user.correo}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <AnimatePresence>
                    {user.roles?.map((role, index) => (
                      <motion.div
                        key={role.trim()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Chip
                          label={role.trim()}
                          variant="filled"
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: "500",
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        <Grid container spacing={4}>
          {/* Columna izquierda - Acciones por rol */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "white",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="600" 
                    gutterBottom 
                    color="primary"
                    sx={{ mb: 3 }}
                  >
                    Acciones Disponibles
                  </Typography>
                  <Divider sx={{ mb: 4 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {user.roles?.map((role) => {
                      const section = roleSections[role.trim()];
                      if (!section) return null;
                      
                      return (
                        <Fade in timeout={800} key={role}>
                          <Box>
                            <Typography 
                              variant="h6" 
                              color="primary" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 600,
                                mb: 2
                              }}
                            >
                              {role.trim()}
                            </Typography>
                            
                            {/* Contenedor grid para las acciones */}
                            <Grid container spacing={2}>
                              {section.actions.map((action) => (
                                <Grid item xs={12} sm={6} key={action.path}>
                                  <ActionButton
                                    label={action.label}
                                    onClick={() => navigate(action.path)}
                                    icon={action.icon}
                                  />
                                </Grid>
                              ))}
                            </Grid>
                            <Divider sx={{ mt: 3, mb: 2 }} />
                          </Box>
                        </Fade>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Columna derecha - Información del sistema */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Información del sistema */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "white",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="600" 
                      gutterBottom 
                      color="primary"
                    >
                      Información del Sistema
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Último acceso
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date().toLocaleDateString("es-ES")}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Estado de la cuenta
                        </Typography>
                        <Chip 
                          label="Activa" 
                          color="primary" 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Configuración rápida */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "white",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="600" 
                      gutterBottom 
                      color="primary"
                    >
                      Configuración Rápida
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <CustomButton 
                        variant="outlined" 
                        size="medium" 
                        startIcon={<Settings />}
                        sx={{ 
                          justifyContent: "flex-start",
                          py: 1,
                          borderRadius: 1,
                          fontWeight: 500,
                          textTransform: "none",
                          color: "primary",
                        }} 
                        onClick={() => navigate("/configuracion")}
                      >
                        Preferencias de usuario
                      </CustomButton>

                      <CustomButton 
                        variant="outlined" 
                        size="medium" 
                        startIcon={<Security />}
                        sx={{ 
                          justifyContent: "flex-start",
                          py: 1,
                          borderRadius: 1,
                          fontWeight: 500,
                          textTransform: "none",
                          color: "primary",
                        }} 
                        onClick={() => navigate("/seguridad")}
                      >
                        Configuración de seguridad
                      </CustomButton>

                      <CustomButton 
                        variant="outlined" 
                        size="medium" 
                        startIcon={<Notifications />}
                        sx={{ 
                          justifyContent: "flex-start",
                          py: 1,
                          borderRadius: 1,
                          fontWeight: 500,
                          textTransform: "none",
                          color: "primary",
                        }} 
                        onClick={() => navigate("/notificaciones")}
                      >
                        Gestionar notificaciones
                      </CustomButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Miuser;