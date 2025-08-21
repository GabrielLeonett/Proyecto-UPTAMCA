import Horario from "../components/Horario";

// Datos de ejemplo para las clases
const HorarioExample = {
  pnf: "Informática",
  trayecto: "I",
  seccion: 1,
  turno: {
    nombreTurno: "Matutino",
    horaInicio: "07:00:00",
    horaFin: "12:15:00",
  },
  dias: [ // Cambiado a minúscula
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
  return <Horario Horario={HorarioExample}></Horario>;
}

/*const clase = {
        id_horario: 1,
        hora_inicio: "21:00:00",
        hora_fin: "22:45:00",
        dia_semana: "Lunes",
        nombre_profesor: "Gabriel Dayer",
        apellido_profesor: "Leonett Armas",
        nombre_unidad_curricular: "Matemáticas Avanzadas",
        valor_seccion: "1",
        valor_trayecto: "I",
        nombre_pnf: "Informática",
        nombre_turno: "Matutino"
        }*/
