import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import CustomButton from "./customButton";
import useApi from "../hook/useApi";
import {
  School, // Director Curricular
  Groups, // Gestión Docente
  AssignmentInd, // Secretaria
} from "@mui/icons-material";
import useSweetAlert from "../hook/useSweetAlert";

export default function ModalEditarRolesAdmin({
  open,
  onClose,
  usuario,
  onGuardar,
}) {
  const axios = useApi();
  const alert = useSweetAlert();
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [rolesActuales, setRolesActuales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Opciones de roles con iconos
  const opcionesRoles = [
    {
      id_rol: 1,
      nombre_rol: "Profesor",
      icon: <School sx={{ fontSize: 40 }} />,
      descripcion: "Gestiona planes de estudio",
      removible: false, // ❌ NO se puede quitar
      siempreActivo: true, // ✅ Siempre está presente
    },
    {
      id_rol: 2,
      nombre_rol: "Coordinador",
      icon: <School sx={{ fontSize: 40 }} />,
      descripcion: "Gestiona planes de estudio",
      removible: false, // ❌ NO se puede quitar
      siempreActivo: true, // ✅ Siempre está presente
    },
    {
      id_rol: 7,
      nombre_rol: "Director/a de gestión Curricular",
      icon: <School sx={{ fontSize: 40 }} />,
      descripcion: "Gestiona planes de estudio",
      removible: true,
      tipo: "admin", // Roles administrativos mutuamente excluyentes
    },
    {
      id_rol: 8,
      nombre_rol: "Director/a de Gestión Permanente y Docente",
      icon: <Groups sx={{ fontSize: 40 }} />,
      descripcion: "Administra cuerpo docente",
      removible: true,
      tipo: "admin", // Roles administrativos mutuamente excluyentes
    },
    {
      id_rol: 9,
      nombre_rol: "Secretari@ Vicerrect@r",
      icon: <AssignmentInd sx={{ fontSize: 40 }} />,
      descripcion: "Apoyo administrativo",
      removible: true,
      tipo: "admin", // Roles administrativos mutuamente excluyentes
    },
  ];

  // Inicializar roles cuando el usuario cambia
  useEffect(() => {
    if (usuario && usuario.roles) {
      setRolesActuales([...usuario.roles]);

      // Asegurar que Profesor y Coordinador siempre estén presentes
      const rolesBase = usuario.roles.filter(rol =>
        rol.id_rol === 1 || rol.id_rol === 2
      );

      // Si no tiene Profesor o Coordinador, agregarlos
      const tieneProfesor = usuario.roles.some(rol => rol.id_rol === 1);
      const tieneCoordinador = usuario.roles.some(rol => rol.id_rol === 2);

      const rolesIniciales = [...usuario.roles];

      if (!tieneProfesor) {
        rolesIniciales.push(opcionesRoles.find(rol => rol.id_rol === 1));
      }
      if (!tieneCoordinador) {
        rolesIniciales.push(opcionesRoles.find(rol => rol.id_rol === 2));
      }

      setRolesSeleccionados(rolesIniciales);
    }
  }, [usuario]);

  const handleRoleSelect = (rol) => {
    setError("");

    // Verificar si el rol ya está seleccionado
    const yaSeleccionado = rolesSeleccionados.some(r => r.id_rol === rol.id_rol);

    if (yaSeleccionado) {
      // Solo permitir remover si el rol es removible y no es siempre activo
      if (rol.removible && !rol.siempreActivo) {
        setRolesSeleccionados(prev =>
          prev.filter(r => r.id_rol !== rol.id_rol)
        );
      }
    } else {
      // Para roles administrativos (tipo "admin"), reemplazar el admin actual
      if (rol.tipo === "admin") {
        // Mantener Profesor y Coordinador, quitar otros admins, agregar el nuevo
        const rolesBase = rolesSeleccionados.filter(r =>
          r.siempreActivo || r.tipo !== "admin"
        );
        setRolesSeleccionados([...rolesBase, rol]);
      } else {
        // Para otros roles (aunque en este caso solo Profesor/Coordinador que son siempre activos)
        setRolesSeleccionados(prev => [...prev, rol]);
      }
    }
  };

  const isRoleSelected = (rol) => {
    return rolesSeleccionados.some(r => r.id_rol === rol.id_rol);
  };

  const isRoleActual = (rol) => {
    return rolesActuales.some(r => r.id_rol === rol.id_rol);
  };

  // Verificar si un rol está forzado a estar seleccionado
  const isRoleForced = (rol) => {
    return rol.siempreActivo;
  };

  const handleGuardar = async () => {
    setCargando(true);
    setError("");

    try {
      // ✅ Confirmar acción antes de enviar
      const confirm = await alert.confirm(
        "¿Desea actualizar los roles del administrador?",
        "Esta acción modificará los permisos asignados al usuario."
      );
      if (!confirm) {
        setCargando(false);
        return; // 👈 Cancela si el usuario no confirma
      }

      // ✅ Preparar datos para enviar
      const datosActualizar = {
        roles: rolesSeleccionados.map((rol) => ({
          id_rol: rol.id_rol,
          nombre_rol: rol.nombre_rol,
        })),
      };

      // ✅ Enviar PATCH request
      const response = await axios.patch(`/admins/${usuario.id}/rol`, datosActualizar);

      if (response.status === 200) {
        alert.success(
          "Roles actualizados con éxito",
          "Los roles del administrador se actualizaron correctamente."
        );

        onGuardar(rolesSeleccionados);
        onClose();
      }
    } catch (error) {
      console.error("Error al actualizar roles:", error);

      // ✅ Manejo estandarizado de errores del backend
      if (error?.error?.totalErrors > 0) {
        error.error.validationErrors.forEach((error_validacion) => {
          alert.toast(error_validacion.field, error_validacion.message);
        });
      } else {
        alert.error(
          error.title || "Error al actualizar los roles",
          error.message || "No se pudieron actualizar los roles del administrador."
        );
      }

      setError("Error al actualizar los roles. Intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    // Restaurar roles originales al cancelar
    setRolesSeleccionados([...rolesActuales]);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancelar}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <Typography component="h3" variant="h4" fontWeight="bold" gutterBottom>
          Roles de Administrador
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Selecciona los roles administrativos para {usuario?.nombre || "el usuario"}
        </Typography>

        {/* Mostrar roles actuales */}
        {rolesActuales.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Roles actuales del usuario:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {rolesActuales.map(rol => (
                <Chip
                  key={rol.id_rol}
                  label={rol.nombre_rol}
                  color="primary"
                  variant="filled"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Mensaje de error */}
        {error && (
          <Typography color="error" variant="body2" mb={2}>
            {error}
          </Typography>
        )}

        <Grid
          container
          spacing={3}
          justifyContent={"center"}
          alignContent={"center"}
        >
          {opcionesRoles.map((rol) => {
            const seleccionado = isRoleSelected(rol);
            const esActual = isRoleActual(rol);
            const esForzado = isRoleForced(rol);

            return (
              <Grid item lg={6} md={6} xs={12} sm={6} key={rol.id_rol}>
                <CustomButton
                  tipo={seleccionado ? "primary" : "outlined"}
                  onClick={() => handleRoleSelect(rol)}
                  disabled={esForzado} // Deshabilitar si es forzado (siempre seleccionado)
                  sx={{
                    width: "100%",
                    height: { xs: 120, sm: 150 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 3,
                    opacity: esForzado ? 0.7 : 1,
                    position: "relative",
                    cursor: esForzado ? "default" : "pointer",
                  }}
                >
                  {rol.icon}
                  <Box textAlign="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {rol.nombre_rol}
                      {esForzado && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: '0.7em',
                            ml: 1,
                            color: seleccionado ? 'primary.contrastText' : 'primary.main'
                          }}
                        >
                          (Siempre)
                        </Box>
                      )}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: seleccionado
                          ? "primary.contrastText"
                          : "text.secondary",
                      }}
                    >
                      {rol.descripcion}
                    </Typography>
                  </Box>

                  {/* Indicador visual para roles forzados */}
                  {esForzado && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  )}
                </CustomButton>
              </Grid>
            );
          })}
        </Grid>

        {/* Información adicional */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Nota:</strong> Los roles de <strong>Profesor</strong> y <strong>Coordinador</strong> son permanentes.
            Los roles administrativos (<strong>Director</strong> y <strong>Secretario</strong>) son mutuamente excluyentes.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <CustomButton
          tipo="outlined"
          onClick={handleCancelar}
          disabled={cargando}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          tipo="primary"
          onClick={handleGuardar}
          disabled={cargando}
          loading={cargando}
        >
          Guardar Cambios
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}