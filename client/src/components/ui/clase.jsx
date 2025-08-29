import { Typography, Box } from "@mui/material";
import { useState, useEffect, useCallback } from "react";

export default function Clase({
  clase,
  onSelect,
  mostrarProfesorSeleccionado,
  isSelected,
  onMoveRequest,
}) {
  const [activo, setActivo] = useState(false);

  // Extraer primer nombre y apellido de forma segura
  const nombre = clase.nombreProfesor?.split(" ")[0] || "";
  const apellido = clase.apellidoProfesor?.split(" ")[0] || "";

  // Función memorizada para convertir a minutos
  const convertirAMinutos = useCallback((hora) => {
    if (!hora) return 0;
    const [horas, minutos] = hora.split(":").map(Number);
    return (horas || 0) * 60 + (minutos || 0);
  }, []);

  // Verificar si la clase está activa actualmente
  useEffect(() => {
    const verificarSiActiva = () => {
      if (!clase?.horaInicio || !clase?.horaFin) {
        setActivo(false);
        return;
      }

      const ahora = new Date();
      const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
      const inicioMin = convertirAMinutos(clase.horaInicio);
      const finMin = convertirAMinutos(clase.horaFin);

      setActivo(minutosActuales >= inicioMin && minutosActuales <= finMin);
    };

    verificarSiActiva();

    // Actualizar cada minuto para clases en curso
    const interval = setInterval(verificarSiActiva, 60000);

    return () => clearInterval(interval);
  }, [clase, convertirAMinutos]);

  // Determinar estilos basados en el estado
  const getEstilos = () => {
    if (isSelected) {
      return {
        backgroundColor: "#e8f5e8",
        border: "2px solid #4caf50",
        color: "#2e7d32",
      };
    }
    if (activo) {
      return {
        backgroundColor: "#fff3cd",
        border: "2px solid #ffc107",
        color: "#856404",
      };
    }
    return {
      backgroundColor: "#d1ecf1",
      border: "1px solid #bee5eb",
      color: "#0c5460",
    };
  };

  const estilos = getEstilos();

  return (
    <Box
      className={`clase ${isSelected ? "selected" : ""}`}
      onDoubleClick={() => onMoveRequest(clase)} // Doble click para mover
      onClick={() => {
        onSelect(clase);
        mostrarProfesorSeleccionado(clase.idProfesor);
      }}
      sx={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        height: "100%",
        padding: "4px",
        borderRadius: "4px",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
        ...estilos,
      }}
    >
      {/* Nombre de la unidad curricular */}
      <Typography
        variant="caption"
        component="div"
        sx={{
          fontWeight: "bold",
          lineHeight: 1.2,
          mb: 0.5,
          fontSize: "0.7rem",
        }}
      >
        {clase.nombreUnidadCurricular || "Sin nombre"}
      </Typography>

      {/* Información del profesor */}
      <Typography
        variant="caption"
        component="div"
        sx={{
          lineHeight: 1.1,
          fontSize: "0.65rem",
          opacity: 0.9,
        }}
        >
        {nombre || apellido ? `Prof. ${nombre} ${apellido}` : "Sin profesor"}
      </Typography>

      {/* Horario de la clase */}
      <Typography
        variant="caption"
        component="div"
        sx={{
          lineHeight: 1.1,
          fontSize: "0.6rem",
          opacity: 0.8,
          mt: 0.5,
        }}
        >
        {clase.horaInicio} - {clase.horaFin}
      </Typography>

      {/* Horario de la clase */}
      <Typography
        variant="caption"
        component="div"
        sx={{
          lineHeight: 1.1,
          fontSize: "0.65rem",
          opacity: 0.9,
        }}
        >
        Aula: {clase.codigoAula}
      </Typography>

      {/* Indicador de estado */}
      {activo && (
        <Box
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#28a745",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
    </Box>
  );
}

// Agregar animación de pulso para el indicador activo
const styles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
`;

// Injectar estilos (puedes hacerlo en tu CSS global también)
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
