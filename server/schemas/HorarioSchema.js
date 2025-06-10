import { z } from "zod";

const HorarioSchema = z.object({
  id_seccion: z
    .number({
      invalid_type_error: "El id de sección debe ser un número",
      required_error: "El id de sección es obligatorio",
    })
    .positive("El id de sección debe ser positivo"),

  id_profesor: z
    .number({
      invalid_type_error: "El id de profesor debe ser un número",
      required_error: "El id de profesor es obligatorio",
    })
    .positive("El id de profesor debe ser positivo"),

  unidad_curricular_id: z
    .number({
      invalid_type_error: "El id de unidad curricular debe ser un número",
      required_error: "El id de unidad curricular es obligatorio",
    })
    .positive("El id de unidad curricular debe ser positivo"),

  dia_semana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], {
    required_error: "El día de la semana es obligatorio",
    invalid_type_error:"El dia tiene que ser Lunes, Martes, Miércoles, Jueves, Viernes, Sabado."
  }),

  hora_inicio: z
    .string({
      invalid_type_error: "La hora de inicio debe ser un texto en formato HH:MM:SS",
      required_error: "La hora de inicio es obligatoria",
    })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Formato de hora inválido (HH:MM:SS)"),

  aula: z
    .string({
      invalid_type_error: "El aula debe ser un texto",
      required_error: "El aula es obligatoria",
    })
    .min(3, "El aula debe tener al menos 3 caracteres")
    .max(50, "El aula no puede exceder los 50 caracteres"),
});

// Validación completa
export const validationHorario = ({input}) => {
  const validationResult = HorarioSchema.safeParse(input);
  return validationResult;
};

// Validación parcial (para actualizaciones)
export const validationPartialHorario = ({input}) => {
  const PartialHorarioSchema = HorarioSchema.partial().safeParse(input);
  return PartialHorarioSchema;
};
