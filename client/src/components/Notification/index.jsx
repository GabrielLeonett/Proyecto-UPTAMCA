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
import { useEffect, useState, useCallback, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import useApi from "../../hook/useApi";
import useWebSocket from "../../hook/useWebSocket";

export default function Notification({ userRoles, userID }) {
  const theme = useTheme();
  const axios = useApi();
  const [target, setTarget] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState(null);

  // ✅ USAR useRef PARA RASTREAR SI YA NOS UNIMOS A LAS SALAS
  const hasJoinedRoomsRef = useRef(false);

  // ✅ USAR EL HOOK DE WEBSOCKET
  const {
    connect,
    on,
    off,
    emit,
    getSocket,
    isConnected: wsIsConnected,
  } = useWebSocket();

  const getNotificationHistory = async () => {
    try {
      const response = await axios.get(`/notifications`);

      // 🔥 ACTUALIZAR ÚLTIMA CONEXIÓN SOLO SI LA PETICIÓN FUE EXITOSA
      localStorage.setItem(
        "ultima_conexion_notificaciones",
        new Date().toISOString()
      );

      return response;
    } catch (err) {
      console.error("❌ Error cargando historial:", err);
      throw err;
    }
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

  // 🔥 Cargar historial de notificaciones al montar el componente
  useEffect(() => {
    const loadNotificationHistory = async () => {
      if (!userID) {
        setLoading(false);
        return;
      }

      try {
        console.log("📥 Cargando historial de notificaciones...");
        const history = await getNotificationHistory();
        setNotifications(history);
        setUpdateTrigger((prev) => prev + 1);
        console.log(`✅ Cargadas ${history.length} notificaciones`);
      } catch (err) {
        console.error("❌ Error cargando historial:", err);
        setError("Error cargando notificaciones");
      } finally {
        setLoading(false);
      }
    };

    loadNotificationHistory();
  }, [userID, userRoles]);

  // ✅ MANEJADORES DE EVENTOS OPTIMIZADOS
  const handleNewNotification = useCallback((data) => {
    console.log("🔔 Nueva notificación recibida:", data);

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
  }, []);

  const handleConnect = useCallback(() => {
    console.log("✅ Notificaciones: WebSocket CONECTADO");
    setSocketConnected(true);
    setLoading(false);
    setError(null);

    // ✅ UNIRSE A LAS SALAS DE ROLES SOLO UNA VEZ AL CONECTAR
    if (!hasJoinedRoomsRef.current && userRoles?.length > 0) {
      userRoles.forEach((role) => {
        emit("join_role_room", role);
        console.log(`✅ Notificaciones: Unido a sala de rol ${role}`);
      });
      hasJoinedRoomsRef.current = true;
    }
  }, [userRoles, emit]);

  const handleConnectError = useCallback((error) => {
    console.error("❌ Notificaciones: Error de conexión WebSocket:", error);
    setSocketConnected(false);
    setLoading(false);
    setError(`Error de conexión: ${error.message}`);
    hasJoinedRoomsRef.current = false;
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("❌ Notificaciones: WebSocket DESCONECTADO");
    setSocketConnected(false);
    hasJoinedRoomsRef.current = false;
  }, []);

  // ✅ CONFIGURAR WEBSOCKET - VERSIÓN MEJORADA
  useEffect(() => {
    if (!userID) {
      console.log("⏸️ Notificaciones: No userID, esperando...");
      return;
    }

    console.log("🚀 Notificaciones: INICIANDO CONEXIÓN WEBSOCKET...");

    // 1. CONFIGURAR EVENTOS PRIMERO (IMPORTANTE)
    console.log("🔧 Notificaciones: Configurando event listeners...");

    on("connect", handleConnect);
    on("disconnect", handleDisconnect);
    on("connect_error", handleConnectError);
    on("new_notification", handleNewNotification);

    // 2. VERIFICAR SI YA ESTÁ CONECTADO INMEDIATAMENTE
    const socket = getSocket();
    console.log("Socket actual:", socket);
    console.log("¿Socket conectado?", socket?.connected);

    if (socket?.connected) {
      console.log("✅ Notificaciones: Ya conectado, actualizando estado...");
      handleConnect(); // ✅ ACTUALIZAR ESTADO INMEDIATAMENTE
    } else {
      // 3. INTENTAR CONECTAR SOLO SI NO ESTÁ CONECTADO
      console.log("🔌 Notificaciones: Intentando conectar...");
      setLoading(true);
      setError(null);

      const connectWebSocket = async () => {
        try {
          console.log("🔄 Notificaciones: Llamando a connect()...");
          await connect(userID, userRoles);
          console.log("✅ Notificaciones: Connect() completado");

          // ✅ VERIFICAR NUEVAMENTE DESPUÉS DE CONECTAR
          const newSocket = getSocket();
          if (newSocket?.connected && !socketConnected) {
            console.log("✅ Forzando actualización de estado...");
            handleConnect();
          }
        } catch (err) {
          console.error("💥 Notificaciones: Error en connect():", err);
          setError(`Error al conectar: ${err.message}`);
          setLoading(false);
        }
      };

      connectWebSocket();
    }

    // 4. CLEANUP
    return () => {
      console.log("🧹 Notificaciones: Limpiando event listeners...");
      off("connect", handleConnect);
      off("disconnect", handleDisconnect);
      off("connect_error", handleConnectError);
      off("new_notification", handleNewNotification);
      hasJoinedRoomsRef.current = false;
    };
  }, [
    userID,
    userRoles,
    connect,
    on,
    off,
    getSocket,
    handleConnect,
    handleDisconnect,
    handleConnectError,
    handleNewNotification,
  ]);

  // ✅ DEBUG EN TIEMPO REAL
  useEffect(() => {
    const interval = setInterval(() => {
      const socket = getSocket();
      console.log("🔍 Notificaciones - Estado actual:", {
        loading,
        socketConnected,
        socketConnectedActual: socket?.connected,
        socketId: socket?.id,
        notificationsCount: notifications.length,
        unreadCount: notifications.filter((n) => !n.leida).length,
      });
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [loading, socketConnected, notifications, getSocket]);

  // 🔥 MEJORADO: Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    if (socketConnected) {
      emit("mark_notification_read", { notificationId });
      console.log("📝 Marcando notificación como leída:", notificationId);
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
                {socketConnected ? " • ✅ Conectado" : " • ❌ Desconectado"}
                {error && ` • ⚠️ ${error}`}
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
                  key={`${notification.id}-${updateTrigger}-${index}`}
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
