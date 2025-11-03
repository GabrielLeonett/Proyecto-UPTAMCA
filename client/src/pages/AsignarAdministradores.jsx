import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import CustomButton from "../components/customButton";
import CustomLabel from "../components/customLabel";

export default function AsignarAdministradores() {
  // Datos de ejemplo (mock)
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Carlos Gómez", correo: "carlos@uptamca.edu.ve", rol: "usuario", avatar: "", estado: "activo" },
    { id: 2, nombre: "María Torres", correo: "maria@uptamca.edu.ve", rol: "admin", avatar: "", estado: "activo" },
    { id: 3, nombre: "Pedro Ruiz", correo: "pedro@uptamca.edu.ve", rol: "usuario", avatar: "", estado: "inactivo" },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [accion, setAccion] = useState("");
  const [alerta, setAlerta] = useState({ open: false, mensaje: "", tipo: "success" });

  // Filtrado
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "todos" ? true : u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  // Acciones
  const handleAsignar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setAccion(usuario.rol === "admin" ? "revocar" : "asignar");
    setOpenDialog(true);
  };

  const handleConfirmar = () => {
    setOpenDialog(false);

    // Aquí conectarías con el backend (axios o fetch)
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioSeleccionado.id
          ? { ...u, rol: accion === "asignar" ? "admin" : "usuario" }
          : u
      )
    );

    setAlerta({
      open: true,
      mensaje:
        accion === "asignar"
          ? "Permisos de administrador asignados correctamente."
          : "Permisos de administrador revocados correctamente.",
      tipo: "success",
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Gestión de Administradores
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Asigna, edita o elimina privilegios administrativos de los usuarios del sistema.
      </Typography>

      {/* Filtros */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: "300px" }}
        />

        <Select
          size="small"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="usuario">Usuarios</MenuItem>
          <MenuItem value="admin">Administradores</MenuItem>
        </Select>
      </Box>

      {/* Tarjetas de usuario */}
      <Grid container spacing={3}>
        {usuariosFiltrados.map((u) => (
          <Grid item xs={12} sm={6} md={4} key={u.id}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={u.avatar}
                      sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}
                    >
                      {u.nombre.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{u.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {u.correo}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Chip
                      label={u.rol === "admin" ? "Administrador" : "Usuario"}
                      color={u.rol === "admin" ? "success" : "default"}
                      size="small"
                    />
                    <CustomButton
                      label={u.rol === "admin" ? "Revocar" : "Asignar"}
                      color={u.rol === "admin" ? "error" : "primary"}
                      onClick={() => handleAsignar(u)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de confirmación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas {accion} permisos de administrador a{" "}
            <strong>{usuarioSeleccionado?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton label="Cancelar" onClick={() => setOpenDialog(false)} />
          <CustomButton
            label="Confirmar"
            color="primary"
            onClick={handleConfirmar}
          />
        </DialogActions>
      </Dialog>

      {/* Alerta */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={3000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={alerta.tipo} variant="filled">
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}
