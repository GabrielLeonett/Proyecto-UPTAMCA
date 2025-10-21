import { z } from "zod";

const disponibilidaddocenteSchema = z.object({
  id_profesor: z
    .number({
      invalid_type_error: "El ID del profesor debe ser un número",
      required_error: "El ID del profesor es obligatorio",
    })
    .int({ message: "El ID del profesor debe ser un número entero" })
    .positive({ message: "El ID del profesor debe ser un número positivo" })
    .optional(),

  dia_semana: z.enum(
    ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    {
      message: "Debe seleccionar un día de la semana válido",
      errorMap: () => ({
        message:
          "Días válidos: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado",
      }),
    }
  ),

  hora_inicio: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: "La hora de inicio debe tener formato HH:MM:SS(24 horas)",
    })
    .nonempty({ message: "La hora de inicio es obligatoria" }),
  hora_fin: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
      message: "La hora de fin debe tener formato HH:MM:SS (24 horas)",
    })
    .nonempty({ message: "La hora de fin es obligatoria" }),
});
export default disponibilidaddocenteSchema;
