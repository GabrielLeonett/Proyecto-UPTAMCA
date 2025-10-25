import { useState } from "react";
import { Button, Typography, Paper } from "@mui/material";
import ResponsiveAppBar from "../../components/navbar";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Generar bloques de 45 minutos entre start y end
const generateTimeBlocks = (startHour, endHour, intervalMinutes = 45) => {
  const blocks = [];
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);

  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    blocks.push(`${hours}:${minutes}`);
    current = new Date(current.getTime() + intervalMinutes * 60000);
  }

  return blocks;
};

// Función para agrupar horas consecutivas en rangos
const groupConsecutiveHours = (hours) => {
  if (hours.length === 0) return [];

  // Convertir horas a minutos para facilitar la comparación
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesArray = hours.map(toMinutes).sort((a, b) => a - b);
  const ranges = [];
  let start = minutesArray[0];
  let end = minutesArray[0];

  for (let i = 1; i < minutesArray.length; i++) {
    // 45 minutos = duración de cada bloque
    if (minutesArray[i] === end + 45) {
      end = minutesArray[i];
    } else {
      // Convertir minutos de vuelta a formato HH:MM
      const startTime = `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`;
      const endTime = `${Math.floor((end + 45) / 60).toString().padStart(2, '0')}:${((end + 45) % 60).toString().padStart(2, '0')}`;
      ranges.push({ inicio: startTime, fin: endTime });

      start = minutesArray[i];
      end = minutesArray[i];
    }
  }

  // Agregar el último rango
  const startTime = `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`;
  const endTime = `${Math.floor((end + 45) / 60).toString().padStart(2, '0')}:${((end + 45) % 60).toString().padStart(2, '0')}`;
  ranges.push({ inicio: startTime, fin: endTime });

  return ranges;
};

export default function DisponibilidadProfesor() {
  const [selectedBlocks, setSelectedBlocks] = useState({});
  const [loading, setLoading] = useState(false);
  const timeBlocks = generateTimeBlocks(7, 20); // 7am a 8pm
  const parametros = useParams();
  const { id_profesor } = parametros;

  // Inicializar selectedBlocks
  DAYS.forEach(day => {
    if (!selectedBlocks[day]) selectedBlocks[day] = [];
  });

  const toggleBlock = (day, hour) => {
    const current = selectedBlocks[day] || [];
    const updated = current.includes(hour)
      ? current.filter(h => h !== hour)
      : [...current, hour];
    setSelectedBlocks({ ...selectedBlocks, [day]: updated });
  };

  const guardarDisponibilidad = async () => {
    if (!id_profesor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de profesor no válido'
      });
      return;
    }

    // Preparar los datos para enviar
    const disponibilidadData = [];

    DAYS.forEach(day => {
      const horasDia = selectedBlocks[day] || [];
      if (horasDia.length > 0) {
        const rangos = groupConsecutiveHours(horasDia);
        rangos.forEach(rango => {
          disponibilidadData.push({
            id_profesor: parseInt(id_profesor),
            dia_semana: day,
            hora_inicio: rango.inicio + ':00', // Agregar segundos
            hora_fin: rango.fin + ':00' // Agregar segundos
          });
        });
      }
    });

    if (disponibilidadData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay horarios seleccionados para guardar'
      });
      return;
    }

    setLoading(true);

    try {
      // Obtener el token de autorización de las cookies
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };

      const token = getCookie('autorization');

      // Enviar cada registro individualmente
      const promises = disponibilidadData.map(async (data) => {
        const response = await axios.post(
          `http://localhost:3000/profesores/${id_profesor}/disponibilidad`, // ✅ Ruta correcta
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // ✅ Recomendado en vez de enviar cookie manual
            },
            withCredentials: true
          }
        );

        return response;
      });

      // Esperar a que todas las peticiones se completen
      const results = await Promise.all(promises);

      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: `Disponibilidad guardada correctamente (${results.length} rangos registrados)`,
        timer: 2000,
        showConfirmButton: false
      });

      console.log('Disponibilidad guardada:', disponibilidadData);
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);

      let errorMessage = 'Error al guardar la disponibilidad';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear el resumen por días
  const getResumenPorDias = () => {
    const resumen = {};

    DAYS.forEach(day => {
      const horasDia = selectedBlocks[day] || [];
      if (horasDia.length > 0) {
        resumen[day] = groupConsecutiveHours(horasDia);
      }
    });

    return resumen;
  };

  const resumen = getResumenPorDias();

  return (
    <>
      <ResponsiveAppBar pages={[]} backgroundColor />

      <div style={{ padding: "20px", marginTop: "80px" }}>
        <Typography variant="h4" gutterBottom>
          Disponibilidad del Profesor
        </Typography>

        <Paper elevation={3} style={{ overflowX: "auto", borderRadius: "12px" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{
              padding: "12px",
              textAlign: "center",
              fontWeight: "bold",
              border: "1px solid #ddd",
              minWidth: "120px"
            }}>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={styles.th}>Hora</th>
                {DAYS.map(day => (
                  <th key={day} style={styles.th}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeBlocks.map(hour => (
                <tr key={hour} style={{ backgroundColor: "#f9f9f9" }}>
                  <td style={styles.hourCell}>{hour}</td>
                  {DAYS.map(day => (
                    <td
                      key={day}
                      onClick={() => toggleBlock(day, hour)}
                      style={{
                        ...styles.cell,
                        backgroundColor: selectedBlocks[day]?.includes(hour)
                          ? "#4caf50"
                          : "#ffffff",
                        color: selectedBlocks[day]?.includes(hour) ? "white" : "black",
                        transition: "0.2s",
                      }}
                    >
                      {selectedBlocks[day]?.includes(hour) ? "✔" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>

        {/* Resumen mejorado */}
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Resumen de disponibilidad:</Typography>
          {Object.keys(resumen).length === 0 ? (
            <Typography color="textSecondary">No hay horarios seleccionados</Typography>
          ) : (
            Object.entries(resumen).map(([dia, rangos]) => (
              <div key={dia} style={{ marginBottom: "10px" }}>
                <Typography>
                  <strong>{dia}:</strong>
                </Typography>
                {rangos.map((rango, index) => (
                  <Typography key={index} style={{ marginLeft: "20px" }}>
                    • {rango.inicio} - {rango.fin}
                  </Typography>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Botón */}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "15px", borderRadius: "8px" }}
          onClick={guardarDisponibilidad}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar disponibilidad"}
        </Button>
      </div>
    </>
  );
}

const styles = {
  th: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "bold",
    border: "1px solid #ddd",
    minWidth: "120px",
  },
  cell: {
    cursor: "pointer",
    textAlign: "center",
    height: "50px",
    border: "1px solid #ddd",
    fontSize: "16px",
    userSelect: "none",
  },
  hourCell: {
    padding: "10px",
    textAlign: "center",
    border: "1px solid #ddd",
    fontWeight: "bold",
    backgroundColor: "#eeeeee",
    minWidth: "80px",
  },
};