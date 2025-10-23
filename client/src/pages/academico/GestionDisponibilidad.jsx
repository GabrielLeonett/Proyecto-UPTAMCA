import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Typography, Paper } from "@mui/material";
import Swal from "sweetalert2";

export default function GestionDisponibilidad() {
  const [disponibilidades, setDisponibilidades] = useState([]);

  const obtenerDisponibilidades = async () => {
    try {
      const res = await axios.get("http://localhost:4000/profesores/disponibilidad");
      setDisponibilidades(res.data);
    } catch (error) {
      console.error("Error al obtener disponibilidades:", error);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:4000/profesores/disponibilidad/${id}`, { estado: nuevoEstado });
      Swal.fire("Éxito", `Disponibilidad ${nuevoEstado.toLowerCase()} correctamente`, "success");
      obtenerDisponibilidades();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  useEffect(() => {
    obtenerDisponibilidades();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Disponibilidades
      </Typography>
      {disponibilidades.length === 0 ? (
        <Typography>No hay disponibilidades registradas.</Typography>
      ) : (
        disponibilidades.map((disp) => (
          <Paper key={disp.id} style={{ margin: "10px 0", padding: "15px" }}>
            <Typography><strong>Profesor:</strong> {disp.profesor_nombre}</Typography>
            <Typography><strong>Día:</strong> {disp.dia_semana}</Typography>
            <Typography><strong>Hora:</strong> {disp.hora_inicio} - {disp.hora_fin}</Typography>
            <Typography><strong>Estado:</strong> {disp.estado}</Typography>
            {disp.estado === "Pendiente" && (
              <div style={{ marginTop: "10px" }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => actualizarEstado(disp.id, "Aprobado")}
                  style={{ marginRight: "10px" }}
                >
                  Aprobar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => actualizarEstado(disp.id, "Rechazado")}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </Paper>
        ))
      )}
    </div>
  );
}
