import { fakerES_MX as faker } from "@faker-js/faker";

const generateHorarioEspanol = () => {
  const diasEspanol = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  const diaAleatorio =
    diasEspanol[Math.floor(Math.random() * diasEspanol.length)];

  // Generar horas aleatorias pero válidas
  const horaInicio = faker.number.int({ min: 7, max: 17 }); // Horas entre 7am y 5pm
  const minutoInicio = faker.helpers.arrayElement([0, 15, 30, 45]);
  const duracion = faker.helpers.arrayElement([60, 90, 120]); // 1, 1.5 o 2 horas
  
  const horaInicioFormato = `${horaInicio.toString().padStart(2, '0')}:${minutoInicio.toString().padStart(2, '0')}:00`;
  
  // Calcular hora fin
  const horaFinHora = horaInicio + Math.floor((minutoInicio + duracion) / 60);
  const horaFinMinuto = (minutoInicio + duracion) % 60;
  const horaFinFormato = `${horaFinHora.toString().padStart(2, '0')}:${horaFinMinuto.toString().padStart(2, '0')}:00`;

  return {
    id_seccion: faker.number.int({ min: 59, max: 249 }),
    idProfesor: faker.number.int({ min: 13, max: 72 }),
    idUnidadCurricular: faker.number.int({ min: 13, max: 114 }),
    idAula: faker.number.int({ min: 41, max: 120 }),
    diaSemana: diaAleatorio,
    horaInicio: horaInicioFormato,
    horaFin: horaFinFormato,
    duracion: duracion,
    tipo_clase: faker.helpers.arrayElement(["teoria", "laboratorio", "practica"]),
    observaciones: faker.lorem.sentence()
  };
};

// Crear múltiples horarios
for (let i = 0; i < 10; i++) {
  const horarioData = generateHorarioEspanol();
  
  // Pequeño delay para evitar sobrecargar
  setTimeout(() => {
    fetch("http://localhost:3000/horarios", {
      method: "POST",
      headers: {
        autorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OTk5OTk5LCJhcGVsbGlkb3MiOiJBZG1pbmlzdHJhZG9yIiwibm9tYnJlcyI6IlN1cGVyIiwicm9sZXMiOlsiU3VwZXJBZG1pbiJdLCJpYXQiOjE3NjgyNTE2NTgsImV4cCI6MTc2ODg1NjQ1OH0.A6ROQ_NkHasr0mFT6GP34TtVf8ehiVHlmjpbPmxjqPY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(horarioData)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => console.log(`Horario ${i + 1} creado:`, data))
      .catch((error) => console.error(`Error en horario ${i + 1}:`, error));
  }, i * 100); // 100ms de delay entre cada request
}