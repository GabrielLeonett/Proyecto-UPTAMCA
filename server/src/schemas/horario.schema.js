import { z } from "zod";

const horarioSchema = z.object({
  id_seccion: z
    .number({
      invalid_type_error: "horarios:validation.id_seccion_invalid_type|El id de sección debe ser un número",
      required_error: "horarios:validation.id_seccion_required|El id de sección es obligatorio",
    })
    .positive("horarios:validation.id_seccion_positive|El id de sección debe ser positivo"),

  id_profesor: z
    .number({
      invalid_type_error: "horarios:validation.id_profesor_invalid_type|El id de profesor debe ser un número",
      required_error: "horarios:validation.id_profesor_required|El id de profesor es obligatorio",
    })
    .positive("horarios:validation.id_profesor_positive|El id de profesor debe ser positivo"),

  id_unidad_curricular: z
    .number({
      invalid_type_error: "horarios:validation.id_unidad_curricular_invalid_type|El id de unidad curricular debe ser un número",
      required_error: "horarios:validation.id_unidad_curricular_required|El id de unidad curricular es obligatorio",
    })
    .positive("horarios:validation.id_unidad_curricular_positive|El id de unidad curricular debe ser positivo"),

  dia_semana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], {
    required_error: "horarios:validation.dia_semana_required|El día de la semana es obligatorio",
    invalid_type_error: "horarios:validation.dia_semana_invalid_enum|El día tiene que ser Lunes, Martes, Miércoles, Jueves, Viernes, Sábado"
  }),

  hora_inicio: z
    .string({
      invalid_type_error: "horarios:validation.hora_inicio_invalid_type|La hora de inicio debe ser un texto en formato HH:MM:SS",
      required_error: "horarios:validation.hora_inicio_required|La hora de inicio es obligatoria",
    })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "horarios:validation.hora_inicio_invalid_format|Formato de hora inválido (HH:MM:SS)"),

  hora_fin: z
    .string({
      invalid_type_error: "horarios:validation.hora_fin_invalid_type|La hora de fin debe ser un texto en formato HH:MM:SS",
      required_error: "horarios:validation.hora_fin_required|La hora de fin es obligatoria",
    })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "horarios:validation.hora_fin_invalid_format|Formato de hora de fin inválido (HH:MM:SS)"),

  id_aula: z
    .number({
      invalid_type_error: "horarios:validation.id_aula_invalid_type|El id del aula debe ser un número",
      required_error: "horarios:validation.id_aula_required|El id del aula es obligatorio",
    })
    .positive("horarios:validation.id_aula_positive|El id del aula debe ser positivo"),
})
.refine((data) => {
  if (!data.hora_inicio || !data.hora_fin) return true;
  return data.hora_fin > data.hora_inicio;
}, {
  message: "horarios:validation.hora_fin_after_start|La hora de fin debe ser posterior a la hora de inicio",
  path: ["hora_fin"]
})
.refine((data) => {
  if (!data.hora_inicio || !data.hora_fin) return true;
  
  const start = new Date(`1970-01-01T${data.hora_inicio}`);
  const end = new Date(`1970-01-01T${data.hora_fin}`);
  const duration = (end - start) / (1000 * 60); // duración en minutos
  
  return duration >= 30; // mínimo 30 minutos
}, {
  message: "horarios:validation.duration_too_short|La duración de la clase debe ser de al menos 30 minutos",
  path: ["hora_fin"]
})
.refine((data) => {
  if (!data.hora_inicio || !data.hora_fin) return true;
  
  const start = new Date(`1970-01-01T${data.hora_inicio}`);
  const end = new Date(`1970-01-01T${data.hora_fin}`);
  const duration = (end - start) / (1000 * 60); // duración en minutos
  
  return duration <= 240; // máximo 4 horas
}, {
  message: "horarios:validation.duration_too_long|La duración de la clase no puede exceder 4 horas",
  path: ["hora_fin"]
});

export default horarioSchema;