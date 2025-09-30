import { Box, Typography, Chip, IconButton, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Launch,
  Schedule,
  Assignment,
  Grade,
  Message,
} from "@mui/icons-material";

export default function NotificationCard({ notification }) {
  const navigate = useNavigate();
  const theme = useTheme();

  // Iconos por tipo de notificación
  const getNotificationIcon = (type) => {
    const icons = {
      course_assigned: <Launch sx={{ color: theme.palette.primary.main }} />,
      schedule_change: <Schedule sx={{ color: theme.palette.warning.main }} />,
      grade_published: <Grade sx={{ color: theme.palette.success.main }} />,
      system_announcement: (
        <Assignment sx={{ color: theme.palette.error.main }} />
      ),
      message_received: (
        <Message sx={{ color: theme.palette.secondary.main }} />
      ),
      deadline_reminder: <Schedule sx={{ color: theme.palette.error.dark }} />,
    };
    return icons[type] || <Assignment />;
  };

  // Colores por prioridad usando el theme
  const getPriorityColor = (priority) => {
    const colors = {
      low: theme.palette.grey[500],
      medium: theme.palette.warning.main,
      high: theme.palette.error.main,
      urgent: theme.palette.error.dark,
    };
    return colors[priority] || theme.palette.grey[500];
  };

  // Manejar clic en la notificación
  const handleNotificationClick = () => {
    if (notification.metadata?.action) {
      switch (notification.metadata.action) {
        case "view_course":
          navigate(`/courses/${notification.metadata.course_id}`);
          break;
        case "view_schedule":
          navigate("/schedule");
          break;
        case "view_grade":
          navigate(`/grades/${notification.metadata.course_id}`);
          break;
        case "view_announcement":
          navigate(`/announcements/${notification.metadata.entity_id}`);
          break;
        case "open_chat":
          navigate(`/messages/${notification.metadata.conversation_id}`);
          break;
        case "view_assignment":
          navigate(`/assignments/${notification.metadata.entity_id}`);
          break;
        default:
          navigate("/notifications");
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        border: `1px solid ${
          notification.is_read
            ? theme.palette.divider
            : theme.palette.primary.main
        }`,
        backgroundColor: notification.is_read
          ? theme.palette.background.paper
          : theme.palette.action.hover,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: notification.is_read
            ? theme.palette.action.hover
            : theme.palette.action.selected,
          transform: "translateY(-1px)",
          boxShadow: theme.shadows[2],
        },
      }}
      onClick={handleNotificationClick}
    >
      {/* Header de la notificación */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getNotificationIcon(notification.type)}
          <Typography
            variant="h6"
            sx={{
              fontWeight: notification.is_read ? "normal" : "bold",
              color: notification.is_read
                ? theme.palette.text.primary
                : theme.palette.primary.main,
              fontSize: theme.typography.body1.fontSize,
            }}
          >
            {notification.title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Indicador de no leído */}
          {!notification.is_read && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: theme.palette.primary.main,
              }}
            />
          )}

          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            {formatDate(notification.created_at)}
          </Typography>
        </Box>
      </Box>

      {/* Cuerpo de la notificación */}
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          color: theme.palette.text.primary,
          lineHeight: 1.5,
        }}
      >
        {notification.body}
      </Typography>

      {/* Metadata y etiquetas */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {/* Chip de tipo */}
        <Chip
          label={notification.type.replace("_", " ")}
          size="small"
          variant="outlined"
          sx={{
            textTransform: "capitalize",
            borderColor: theme.palette.divider,
          }}
        />

        {/* Chip de prioridad */}
        {notification.metadata?.priority && (
          <Chip
            label={notification.metadata.priority}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(notification.metadata.priority),
              color: theme.palette.common.white,
              fontWeight: "bold",
            }}
          />
        )}

        {/* Información adicional del metadata */}
        {notification.metadata?.course_name && (
          <Chip
            label={notification.metadata.course_name}
            size="small"
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
            }}
          />
        )}

        {notification.metadata?.due_date && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.error.main,
              fontWeight: "bold",
            }}
          >
            Vence: {formatDate(notification.metadata.due_date)}
          </Typography>
        )}
      </Box>

      {/* Acciones rápidas */}
      {notification.metadata?.actions && (
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {notification.metadata.actions.slice(0, 2).map((action, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (action.url) {
                  navigate(action.url);
                }
                // Aquí puedes agregar más lógica para otras acciones
              }}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 1,
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <Launch fontSize="small" />
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
}
