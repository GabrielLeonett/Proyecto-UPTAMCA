import Profesores from "../pages/Profesores";
import {Clase} from "./ui/clase";
import { Box, Typography } from "@mui/material";

const clase = [{
  dia: "Lunes",
  hora_inicio: "08:00",
  hora_fin: "10:00",
  profesor: "Juan Perez",
  unidad_curricular: "Matemáticas"
}]

export default function Horario ({Pnf, trayecto, seccion, clases}) {
    <div style={{ overflowX: "auto", padding: "20px" }}>
      <h2>Disponibilidad del Profesor</h2>
      <table style={{ border:'1px solid black' }}>
        <thead>
          <tr>
            <th>Hora</th>
            {clase.map(day => <th key={day.dia}>{day.dia}</th>)}
          </tr>
        </thead>
        <tbody>
          {timeBlocks.map(hour => (
            <tr key={hour}>
              <td>{hour}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
}

