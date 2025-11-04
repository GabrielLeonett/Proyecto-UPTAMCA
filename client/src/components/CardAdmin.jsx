import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import CustomButton from "./customButton";
import CustomChip from "./CustomChip";
import ModalCambiarRolAdmin from "./ModalCambiarRolAdmin"; // Asegúrate de que la ruta sea correcta

export default function CardAdmin({ usuario, onRolActualizado }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  // Función para obtener iniciales del nombre
  const getInitials = (nombres, apellidos) => {
    const firstInitial = nombres ? nombres.charAt(0) : "";
    const lastInitial = apellidos ? apellidos.charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // Función para determinar el color del estado
  const getStatusColor = (activo) => {
    return activo ? "success" : "error";
  };

  // Función para determinar el texto del botón basado en roles
  const getButtonAction = (roles) => {
    // Si tiene roles administrativos (excluyendo profesor), mostrar "Gestionar Roles"
    const hasAdminRoles = roles?.some(
      (rol) => rol.id_rol !== 1 && rol.nombre_rol !== "Profesor"
    );
    return hasAdminRoles ? "Gestionar Roles" : "Asignar Roles";
  };

  // Función para determinar el color del botón
  const getButtonColor = (roles) => {
    const hasAdminRoles = roles?.some(
      (rol) => rol.id_rol !== 1 && rol.nombre_rol !== "Profesor"
    );
    return hasAdminRoles ? "primary" : "primary";
  };

  // Manejar apertura del modal
  const handleAbrirModal = () => {
    setModalAbierto(true);
  };

  // Manejar cierre del modal
  const handleCerrarModal = () => {
    setModalAbierto(false);
  };

  // Manejar guardado de roles
  const handleGuardarRoles = (nuevosRoles) => {
    console.log("Roles actualizados:", nuevosRoles);
    
    // Si hay una función callback del componente padre, ejecutarla
    if (onRolActualizado) {
      onRolActualizado(usuario.cedula, nuevosRoles);
    }
    
    // Cerrar modal
    setModalAbierto(false);
  };

  // Preparar datos del usuario para el modal
  const usuarioParaModal = {
    id: usuario.cedula, // Usar cédula como identificador
    nombre: `${usuario.nombres} ${usuario.apellidos}`,
    roles: usuario.roles || []
  };

  return (
    <>
      <Card
        elevation={2}
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          transition: "transform 0.2s, box-shadow 0.2s",
          ":hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          height: "100%",
          cursor: "pointer",
        }}
        onClick={handleAbrirModal}
      >
        <CardContent>
          {/* Header con avatar e información básica */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              src={usuario.imagen ? `/uploads/${usuario.imagen}` : undefined}
              sx={{
                width: 60,
                height: 60,
                bgcolor: usuario.imagen ? "transparent" : "primary.main",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {!usuario.imagen && getInitials(usuario.nombres, usuario.apellidos)}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} noWrap>
                {usuario.nombres} {usuario.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {usuario.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                C.I: {usuario.cedula}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información adicional */}
          <Box mb={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="caption" color="text.secondary">
                Estado:
              </Typography>
              <CustomChip
                label={usuario.activo ? "Activo" : "Inactivo"}
                color={getStatusColor(usuario.activo)}
                size="small"
              />
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="caption" color="text.secondary">
                Último acceso:
              </Typography>
              <Typography variant="caption" fontWeight="medium">
                {usuario.last_login ? formatDate(usuario.last_login) : "Nunca"}
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="caption" color="text.secondary">
                Primera vez:
              </Typography>
              <CustomChip
                label={usuario.primera_vez ? "Sí" : "No"}
                color={usuario.primera_vez ? "warning" : "default"}
                size="small"
              />
            </Box>
          </Box>

          {/* Roles */}
          <Box mb={2}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}
            >
              Roles:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {usuario.nombre_roles?.map((rol, index) => (
                <Chip
                  key={index}
                  label={rol}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: "0.7rem" }}
                />
              ))}
              {(!usuario.nombre_roles || usuario.nombre_roles.length === 0) && (
                <Typography variant="caption" color="text.disabled">
                  Sin roles asignados
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Acciones */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Registrado: {formatDate(usuario.created_at)}
              </Typography>
            </Box>
            <CustomButton
              tipo={getButtonColor(usuario.roles)}
              size="small"
              sx={{ minWidth: 120 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevenir que se active el click de la card
                handleAbrirModal();
              }}
            >
              {getButtonAction(usuario.roles)}
            </CustomButton>
          </Box>
        </CardContent>
      </Card>

      {/* Modal para gestionar roles */}
      <ModalCambiarRolAdmin
        open={modalAbierto}
        onClose={handleCerrarModal}
        usuario={usuarioParaModal}
        onGuardar={handleGuardarRoles}
      />
    </>
  );
}