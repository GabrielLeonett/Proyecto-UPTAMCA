import {
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  useTheme,
  CircularProgress,
} from "@mui/material";
import NotificationCard from "./NotificationCard";
import NotificationTarget from "./NotificationTarget";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import io from "socket.io-client";
import useApi from "../../hook/useApi";

export default function Notification({ userRoles, userID }) {
  const theme = useTheme();
  const axios = useApi();
  const [target, setTarget] = useState(false);
  const [filter, setFilter] = useState("all");
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const getNotificationHistory = async () => {
    const response = await axios.get(`/notifications`);

    // 🔥 ACTUALIZAR ÚLTIMA CONEXIÓN SOLO SI LA PETICIÓN FUE EXITOSA
    localStorage.setItem(
      "ultima_conexion_notificaciones",
      new Date().toISOString()
    );

    return response;
  };

  // 🔥 INICIALIZAR ÚLTIMA CONEXIÓN SI NO EXISTE
  useEffect(() => {
    if (!localStorage.getItem("ultima_conexion_notificaciones")) {
      localStorage.setItem(
        "ultima_conexion_notificaciones",
        new Date().toISOString()
      );
    }
  }, []);

  // 🔥 NUEVO: Cargar historial de notificaciones al montar el componente
  useEffect(() => {
    const loadNotificationHistory = async () => {
      if (!userID) {
        setLoading(false);
        return;
      }

      try {
        const history = await getNotificationHistory();
        setNotifications(history);
        setUpdateTrigger((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationHistory();
  }, [userID, userRoles]);

  // Conectar socket cuando el componente se monta
  useEffect(() => {
    if (!userID) {
      return;
    }

    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"], // Permitir ambos
      withCredentials: true,
      auth: {
        user_id: userID,
        roles: userRoles,
      },
      timeout: 20000 ,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Timeout de seguridad
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const handleConnect = () => {
      setSocket(newSocket);

      // Unirse a salas por rol
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach((role) => {
          newSocket.emit("join_role_room", role);
        });
      }

      // ❌ YA NO SOLICITAMOS NOTIFICACIONES POR SOCKET
      // porque ya las cargamos via HTTP
      clearTimeout(safetyTimeout);
    };

    const handleNewNotification = (data) => {
      let notificationData = data;

      // Si viene envuelta en data.data, extraerla
      if (data && data.data) {
        notificationData = data.data;
      }

      // Asegurarnos que es un array
      if (!Array.isArray(notificationData)) {
        notificationData = [notificationData];
      }

      // 🔥 AGREGAR AL INICIO para que las nuevas aparezcan primero
      setNotifications((prev) => [...notificationData, ...prev]);
      setUpdateTrigger((prev) => prev + 1);
      clearTimeout(safetyTimeout);
    };

    const handleConnectError = () => {
      clearTimeout(safetyTimeout);
    };

    const handleDisconnect = () => {
      clearTimeout(safetyTimeout);
    };

    // ✅ SOLO los eventos necesarios
    newSocket.on("connect", handleConnect);
    newSocket.on("new_notification", handleNewNotification); // Solo nuevas notificaciones
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("disconnect", handleDisconnect);

    // Cleanup
    return () => {
      clearTimeout(safetyTimeout);

      // Remover todos los listeners
      newSocket.off("connect", handleConnect);
      newSocket.off("new_notification", handleNewNotification);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("disconnect", handleDisconnect);

      newSocket.close();
    };
  }, [userID, userRoles]);

  // 🔥 MEJORADO: Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    if (socket && socket.connected) {
      socket.emit("mark_notification_read", { notificationId });
    }

    // ✅ ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, leida: true, fecha_lectura: new Date().toISOString() }
          : notif
      )
    );
    setUpdateTrigger((prev) => prev + 1);
  };

  // ✅ CALCULAR NOTIFICACIONES NO LEÍAS
  const numNotificationsNoRead = notifications.filter(
    (notification) => !notification.leida
  ).length;

  // ✅ FILTRAR NOTIFICACIONES
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.leida;
    if (filter === "read") return notification.leida;
    return notification.tipo_notificacion === filter;
  });

  // ✅ CONTADORES PARA LOS FILTROS
  const allCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.leida).length;
  const readCount = notifications.filter((n) => n.leida).length;

  return (
    <Box>
      <NotificationTarget
        NumNotificationNoRead={numNotificationsNoRead}
        setTarget={setTarget}
        Target={target}
      />

      {/* Panel de notificaciones cuando está abierto */}
      {target && (
        <Box
          sx={{
            position: { xs: "fixed", md: "absolute" },
            top: { xs: 0, md: 60 },
            right: { xs: 0, md: 60 },
            bottom: { xs: 0, md: "auto" },
            left: { xs: 0, md: "auto" },
            width: { xs: "100%", md: 400 },
            height: { xs: "100%", md: "auto" },
            maxHeight: { xs: "none", md: 500 },
            backgroundColor: theme.palette.background.paper,
            border: { xs: "none", md: "1px solid" },
            borderColor: theme.palette.divider,
            borderRadius: { xs: 0, md: 2 },
            boxShadow: { xs: theme.shadows[0], md: theme.shadows[8] },
            zIndex: theme.zIndex.modal,
            overflow: "hidden",
          }}
        >
          {/* Header del panel con botón de cerrar */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={theme.palette.text.primary}
              >
                Notificaciones
              </Typography>
              <Typography variant="body2" color={theme.palette.text.secondary}>
                {unreadCount} sin leer de {allCount} totales
                {loading && " - Cargando..."}
              </Typography>
            </Box>

            {/* Botón de cerrar - visible solo en móvil */}
            <IconButton
              onClick={() => setTarget(false)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: theme.palette.text.primary,
              }}
              aria-label="Cerrar notificaciones"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Filtros */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`Todas (${allCount})`}
                variant={filter === "all" ? "filled" : "outlined"}
                onClick={() => setFilter("all")}
                color="primary"
                size="small"
              />
              <Chip
                label={`No leídas (${unreadCount})`}
                variant={filter === "unread" ? "filled" : "outlined"}
                onClick={() => setFilter("unread")}
                color="error"
                size="small"
              />
              <Chip
                label={`Leídas (${readCount})`}
                variant={filter === "read" ? "filled" : "outlined"}
                onClick={() => setFilter("read")}
                size="small"
                sx={{
                  backgroundColor:
                    filter === "read" ? theme.palette.success.main : undefined,
                  color:
                    filter === "read" ? theme.palette.common.white : undefined,
                }}
              />
            </Stack>
          </Box>

          {/* Lista de notificaciones */}
          <Box
            sx={{
              maxHeight: { xs: "calc(100% - 180px)", md: 350 },
              overflow: "auto",
              height: { xs: "100%", md: "auto" },
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {loading ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress size={24} />
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                  sx={{ mt: 1 }}
                >
                  Cargando notificaciones...
                </Typography>
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  No hay notificaciones{" "}
                  {filter !== "all" ? `con el filtro "${filter}"` : ""}
                </Typography>
              </Box>
            ) : (
              filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={`${notification.id}-${updateTrigger}-${index}`} // ✅ Key única que cambia
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
