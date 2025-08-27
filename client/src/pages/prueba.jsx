import Horario from "../components/Horario";
// Datos de ejemplo para las clases
const HorarioExample = {
  pnf: "Informática",
  trayecto: 1,
  seccion: 1,
  turno: {
    nombreTurno: "Matutino",
    horaInicio: "07:00:00",
    horaFin: "12:15:00",
  },
  dias: [
    // Cambiado a minúscula
    {
      nombre: "Lunes", // Ahora coincidirá con 'lunes' en tableMatriz
      clases: [
        {
          id: 1,
          horaInicio: "07:00:00",
          horaFin: "09:15:00",
          nombreProfesor: "Gabriel Dayer",
          apellidoProfesor: "Leonett Armas",
          nombreUnidadCurricular: "Matemáticas Avanzadas",
        },
        {
          id: 2,
          horaInicio: "09:15:00",
          horaFin: "11:30:00",
          nombreProfesor: "Gabriel Dayer",
          apellidoProfesor: "Leonett Armas",
          nombreUnidadCurricular: "Programación I",
        },
      ],
    },
    {
      nombre: "Viernes", // Ahora coincidirá con 'lunes' en tableMatriz
      clases: [
        {
          id: 1,
          horaInicio: "07:00:00",
          horaFin: "09:15:00",
          nombreProfesor: "Gabriel Dayer",
          apellidoProfesor: "Leonett Armas",
          nombreUnidadCurricular: "Matemáticas Avanzadas",
        },
      ],
    },
  ],
};

export default function Prueba() {
  return (
    <Horario
      Horario={HorarioExample.dias}
      PNF={HorarioExample.pnf}
      Trayecto={HorarioExample.trayecto}
      Seccion={HorarioExample.seccion}
      Custom={true}
    ></Horario>
  );
}
