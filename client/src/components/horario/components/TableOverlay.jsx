import {
  Box,
  Fade,
  IconButton,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const TableOverlay = ({
  isVisible,
  isCustom,
  setCustom,
  onPrint,
  onClose,
  title = "Opciones del Horario",
}) => {
  const theme = useTheme();

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    }
  };

  const ActionCard = ({
    icon,
    title,
    description,
    onClick,
    disabled = false,
  }) => (
    <Card
      sx={{
        width: 200,
        height: 200,
        transition: "all 0.3s ease-in-out",
        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        "&:hover": !disabled
          ? {
              transform: "translateY(-4px)",
              boxShadow: theme.shadows[8],
              border: `2px solid ${theme.palette.primary.main}`,
            }
          : {},
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={disabled}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <IconButton
            size="large"
            disabled={disabled}
            sx={{
              mb: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": !disabled
                ? {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                : {},
              width: 80,
              height: 80,
            }}
          >
            {icon}
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            fontWeight="bold"
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Fade in={isVisible} timeout={500}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: "blur(4px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          boxShadow: theme.shadows[10],
          p: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header */}
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.grey[500], 0.2),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          fontWeight="bold"
          color="primary"
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>

        {/* Actions Grid */}
        <Stack direction="row" spacing={4} alignItems="center">
          <ActionCard
            icon={
              <EditIcon
                sx={{ fontSize: "3rem", color: theme.palette.primary.main }}
              />
            }
            title="Editar"
            onClick={() => {
              setCustom((prev) => {
                return !prev;
              });
            }}
            description="Modificar horario existente"
            disabled={!isCustom}
          />

          <ActionCard
            icon={
              <PrintIcon
                sx={{ fontSize: "3rem", color: theme.palette.secondary.main }}
              />
            }
            title="Imprimir"
            description="Generar PDF del horario"
            onClick={handlePrintClick}
          />
        </Stack>

        {/* Instructions */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 4,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          {!isCustom &&
            "El modo de edición no está disponible en esta vista. Solo puedes imprimir el horario."}
        </Typography>
      </Box>
    </Fade>
  );
};

export default TableOverlay;
