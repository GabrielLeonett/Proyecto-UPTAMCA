import React, { useState } from "react";
import { Button, Typography, Paper } from "@mui/material";
import ResponsiveAppBar from "../components/navbar";

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

export default function Disponibilidad() {
  const [selectedBlocks, setSelectedBlocks] = useState({});
  const timeBlocks = generateTimeBlocks(7, 20); // 7am a 8pm

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

        {/* Resumen */}
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Resumen de disponibilidad:</Typography>
          {DAYS.map(day => {
            const blocks = selectedBlocks[day];
            if (!blocks || blocks.length === 0) return null;
            return (
              <Typography key={day}>
                <strong>{day}:</strong> {blocks.join(", ")}
              </Typography>
            );
          })}
        </div>

        {/* Botón */}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "15px", borderRadius: "8px" }}
          onClick={() => console.log(selectedBlocks)}
        >
          Guardar disponibilidad
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
