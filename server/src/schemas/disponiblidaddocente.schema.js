import { z } from "zod";

const disponibilidaddocenteSchema = z.object({
  id_profesor: z
    .number({
      invalid_type_error: "disponibilidad_docente:validation.id_profesor_invalid_type|El ID del profesor debe ser un número",
      required_error: "disponibilidad_docente:validation.id_profesor_required|El ID del profesor es obligatorio",
    })
    .int({ message: "disponibilidad_docente:validation.id_profesor_integer|El ID del profesor debe ser un número entero" })
    .positive({ message: "disponibilidad_docente:validation.id_profesor_positive|El ID del profesor debe ser un número positivo" })
    .optional(),

  dia_semana: z.enum(
    ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    {
      required_error: "disponibilidad_docente:validation.dia_semana_required|El día de la semana es obligatorio",
      invalid_type_error: "disponibilidad_docente:validation.dia_semana_invalid_enum|Debe seleccionar un día de la semana válido",
      error_map: () => ({
        message: "disponibilidad_docente:validation.dia_semana_valid_days|Días válidos: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado",
      }),
    }
  ),

  hora_inicio: z
    .string({
      invalid_type_error: "disponibilidad_docente:validation.hora_inicio_invalid_type|La hora de inicio debe ser un texto",
      required_error: "disponibilidad_docente:validation.hora_inicio_required|La hora de inicio es obligatoria",
    })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: "disponibilidad_docente:validation.hora_inicio_invalid_format|La hora de inicio debe tener formato HH:MM:SS (24 horas)",
    }),

  hora_fin: z
    .string({
      invalid_type_error: "disponibilidad_docente:validation.hora_fin_invalid_type|La hora de fin debe ser un texto",
      required_error: "disponibilidad_docente:validation.hora_fin_required|La hora de fin es obligatoria",
    })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: "disponibilidad_docente:validation.hora_fin_invalid_format|La hora de fin debe tener formato HH:MM:SS (24 horas)",
    }),
})
.refine((data) => {
  if (!data.hora_inicio || !data.hora_fin) return true;
  return data.hora_fin > data.hora_inicio;
}, {
  message: "disponibilidad_docente:validation.hora_fin_after_start|La hora de fin debe ser posterior a la hora de inicio",
  path: ["hora_fin"]
});

export default disponibilidaddocenteSchema;