import {
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  IconButton,
  useTheme,
} from "@mui/material";
import NotificationCard from "./NotificationCard";
import NotificationTarget from "./NotificationTarget";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import io from "socket.io-client";

export default function Notification() {
  const theme = useTheme();
  const [target, setTarget] = useState(false);
  const [filter, setFilter] = useState("all");

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Crear conexión - newSocket YA es el objeto socket
    const newSocket = io("ws://localhost:3000", {
      transports: ["websocket"],
      autoConnect: true,
      forceNew: true,
    });

    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("message", (msg) => {
        console.log(msg);
      });
    }
  }, [socket]);

  // Calcular notificaciones no leídas
  const numNotificationsNoRead = notificationsExample.filter(
    (notification) => !notification.is_read
  ).length;

  // Filtrar notificaciones
  const filteredNotifications = notificationsExample.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return notification.type === filter;
  });

  // Contadores para los filtros
  const allCount = notificationsExample.length;
  const unreadCount = notificationsExample.filter((n) => !n.is_read).length;
  const readCount = notificationsExample.filter((n) => n.is_read).length;

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
            {filteredNotifications.length === 0 ? (
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
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </Box>

          {/* Footer con acciones - Solo en desktop */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: theme.palette.divider,
              display: { xs: "none", md: "block" },
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                // Lógica para marcar todas como leídas
                console.log("Marcar todas como leídas");
              }}
              sx={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                },
              }}
            >
              Marcar todas como leídas
            </Button>
          </Box>

          {/* Footer para móvil */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: theme.palette.divider,
              display: { xs: "block", md: "none" },
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => setTarget(false)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
const notificationsExample = [
  {
    id: 1,
    user_id: "12345678",
    type: "course_assigned",
    title: "Nuevo Curso Asignado",
    body: "Se te ha asignado el curso de Matemáticas I con el profesor Carlos Rodríguez",
    is_read: false,
    read_at: null,
    metadata: {
      action: "view_course",
      entity_type: "course",
      entity_id: "MAT101",
      course_id: "MAT101",
      course_name: "Matemáticas I",
      professor_id: "PROF123",
      professor_name: "Carlos Rodríguez",
      semester: "2024-1",
      classroom: "A-201",
      schedule: "Lunes y Miércoles 8:00-10:00 AM",
      priority: "high",
      category: "academic",
      icon: "📚",
      color: "#3B82F6",
      actions: [
        {
          label: "Ver Curso",
          action: "navigate",
          url: "/courses/MAT101",
        },
        {
          label: "Ver Horario",
          action: "navigate",
          url: "/schedule",
        },
      ],
    },
    created_at: "2024-01-15T10:30:00Z",
    is_mass: false,
    mass_parent_id: null,
  },
  {
    id: 2,
    user_id: "12345678",
    type: "schedule_change",
    title: "Cambio de Aula",
    body: "La clase de Física II ha sido movida del aula B-105 al aula C-201",
    is_read: true,
    read_at: "2024-01-15T11:00:00Z",
    metadata: {
      action: "view_schedule",
      entity_type: "schedule",
      entity_id: "SCHED456",
      course_id: "FIS102",
      course_name: "Física II",
      old_classroom: "B-105",
      new_classroom: "C-201",
      class_date: "2024-01-20",
      start_time: "14:00",
      end_time: "16:00",
      professor_id: "PROF456",
      priority: "medium",
      category: "schedule",
      icon: "🚨",
      color: "#F59E0B",
      actions: [
        {
          label: "Ver Horario Actualizado",
          action: "navigate",
          url: "/schedule",
        },
        {
          label: "Ver Mapa de Aulas",
          action: "navigate",
          url: "/campus-map",
        },
      ],
    },
    created_at: "2024-01-15T09:15:00Z",
    is_mass: false,
    mass_parent_id: null,
  },
  {
    id: 3,
    user_id: "12345678",
    type: "grade_published",
    title: "Calificación Publicada",
    body: "Tu calificación del examen parcial de Química I ha sido publicada: 18.5/20",
    is_read: false,
    read_at: null,
    metadata: {
      action: "view_grade",
      entity_type: "grade",
      entity_id: "GRADE789",
      course_id: "QUI101",
      course_name: "Química I",
      assignment_name: "Examen Parcial",
      score: 18.5,
      max_score: 20,
      percentage: 92.5,
      letter_grade: "A",
      professor_id: "PROF789",
      priority: "medium",
      category: "academic",
      icon: "📊",
      color: "#10B981",
      actions: [
        {
          label: "Ver Detalles de Calificación",
          action: "navigate",
          url: "/grades/QUI101",
        },
        {
          label: "Descargar Boleta",
          action: "download",
          url: "/download/transcript",
        },
      ],
    },
    created_at: "2024-01-15T14:20:00Z",
    is_mass: false,
    mass_parent_id: null,
  },
  {
    id: 4,
    user_id: "12345678",
    type: "system_announcement",
    title: "Mantenimiento Programado",
    body: "El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 6:00 AM",
    is_read: false,
    read_at: null,
    metadata: {
      action: "view_announcement",
      entity_type: "system",
      entity_id: "SYS123",
      priority: "high",
      category: "system",
      maintenance_start: "2024-01-20T02:00:00Z",
      maintenance_end: "2024-01-20T06:00:00Z",
      affected_services: [
        "Plataforma Académica",
        "Base de Datos",
        "Sistema de Notas",
      ],
      icon: "🔧",
      color: "#EF4444",
      actions: [
        {
          label: "Ver Anuncio Completo",
          action: "navigate",
          url: "/announcements/SYS123",
        },
      ],
    },
    created_at: "2024-01-14T16:45:00Z",
    is_mass: true,
    mass_parent_id: 1001,
  },
  {
    id: 5,
    user_id: "12345678",
    type: "message_received",
    title: "Nuevo Mensaje",
    body: "Tienes un nuevo mensaje de María González: 'Hola, ¿podrías ayudarme con el proyecto de programación?'",
    is_read: false,
    read_at: null,
    metadata: {
      action: "open_chat",
      entity_type: "message",
      entity_id: "MSG456",
      sender_id: "87654321",
      sender_name: "María González",
      conversation_id: "CONV123",
      message_preview:
        "Hola, ¿podrías ayudarme con el proyecto de programación?",
      priority: "low",
      category: "message",
      icon: "💬",
      color: "#8B5CF6",
      actions: [
        {
          label: "Responder",
          action: "navigate",
          url: "/messages/CONV123",
        },
        {
          label: "Marcar como Leído",
          action: "mark_read",
        },
      ],
    },
    created_at: "2024-01-15T08:30:00Z",
    is_mass: false,
    mass_parent_id: null,
  },
  {
    id: 6,
    user_id: "12345678",
    type: "deadline_reminder",
    title: "Recordatorio de Entrega",
    body: "Recuerda que la tarea de Cálculo II vence mañana a las 11:59 PM",
    is_read: false,
    read_at: null,
    metadata: {
      action: "view_assignment",
      entity_type: "assignment",
      entity_id: "ASSIGN789",
      course_id: "CAL202",
      course_name: "Cálculo II",
      assignment_name: "Tarea 3 - Derivadas Parciales",
      due_date: "2024-01-16T23:59:59Z",
      days_remaining: 1,
      priority: "urgent",
      category: "academic",
      icon: "⏰",
      color: "#DC2626",
      actions: [
        {
          label: "Ver Tarea",
          action: "navigate",
          url: "/assignments/ASSIGN789",
        },
        {
          label: "Subir Archivo",
          action: "navigate",
          url: "/submit/ASSIGN789",
        },
      ],
    },
    created_at: "2024-01-15T07:00:00Z",
    is_mass: false,
    mass_parent_id: null,
  },
];
