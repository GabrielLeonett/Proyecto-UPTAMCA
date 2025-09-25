import { z } from "zod";

export const DisponibilidadDocenteSchema = z
  .object({
    id_profesor: z
      .number({
        invalid_type_error: "El ID del profesor debe ser un número",
        required_error: "El ID del profesor es obligatorio",
      })
      .int({ message: "El ID del profesor debe ser un número entero" })
      .positive({ message: "El ID del profesor debe ser un número positivo" }),

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
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "La hora de inicio debe tener formato HH:MM (24 horas)",
      })
      .nonempty({ message: "La hora de inicio es obligatoria" })
      .refine(
        (hora) => {
          const [horas, minutos] = hora.split(":").map(Number);
          return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
        },
        { message: "Hora de inicio inválida" }
      ),

    hora_fin: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "La hora de fin debe tener formato HH:MM (24 horas)",
      })
      .nonempty({ message: "La hora de fin es obligatoria" })
      .refine(
        (hora) => {
          const [horas, minutos] = hora.split(":").map(Number);
          return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
        },
        { message: "Hora de fin inválida" }
      ),
  })
  .refine(
    (data) => {
      // Validación personalizada: hora_inicio debe ser menor que hora_fin
      const [horaInicioH, horaInicioM] = data.hora_inicio
        .split(":")
        .map(Number);
      const [horaFinH, horaFinM] = data.hora_fin.split(":").map(Number);

      const inicioMinutos = horaInicioH * 60 + horaInicioM;
      const finMinutos = horaFinH * 60 + horaFinM;

      return inicioMinutos < finMinutos;
    },
    {
      message: "La hora de inicio debe ser anterior a la hora de fin",
      path: ["hora_fin"],
    }
  );

// Validación completa
export const validationDisponibilidadDocente = (input) => {
  return DisponibilidadDocenteSchema.safeParse(input);
};

// Validación parcial (para actualizaciones)
export const validationPartialDisponibilidadDocente = (input) => {
  const PartialSchema = DisponibilidadDocenteSchema.partial();
  return PartialSchema.safeParse(input);
};
