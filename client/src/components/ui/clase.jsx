import { Typography } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { useState, useEffect } from "react";

export default function Clase({ clase }) {
  const [nombre] = clase.nombreProfesor.split(" ");

  const [apellido] = clase.apellidoProfesor.split(" ");

  const [activo, setActivo] = useState(Boolean);

  const convertirAMinutos = (hora) => {
    const [horas, minutos] = hora.split(":");
    return parseInt(horas) * 100 + parseInt(minutos);
  };

  useEffect(() => {
    const isActivo = (hora_inicio, hora_fin) => {
      let tiempo = new Date();
      const inicioMin = convertirAMinutos(hora_inicio);
      const finMin = convertirAMinutos(hora_fin);
      tiempo = convertirAMinutos(
        `${tiempo.getHours()}:${tiempo.getMinutes()}:00`
      );
      if (tiempo > inicioMin && tiempo < finMin) return true;
    };
    setActivo(isActivo(clase.horaInicio, clase.horaFin));
  }, [clase]);

  return (
    <div
      key={clase.id}
      style={{
        backgroundColor: activo ? "#09ff0081" : "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Centra verticalmente
        alignItems: "center", // Centra horizontalmente
        textAlign: "center",
        width: 'auto',
        height: '100%'
      }}
    >
      <Typography component="div" variant="caption" style={{ margin: "2px" }}>
        {clase.nombreUnidadCurricular}
      </Typography>
      <Typography component="div" variant="caption" style={{ margin: "2px" }}>
        Prof.{nombre} {apellido}
      </Typography>
    </div>
  );
}
