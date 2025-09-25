// src/schemas/AulaSchema.js
import { z } from "zod";

export const AulaSchema = z.object({
  codigo: z
    .string()
    .min(3, { message: "El código debe tener al menos 3 caracteres" })
    .max(10, { message: "El código no puede tener más de 10 caracteres" })
    .nonempty({ message: "El código es obligatorio" }),

  tipo: z.enum(
    ["Convencional", "Interactiva", "Computación", "Exterior", "Laboratorio"],
    { message: "Debe seleccionar un tipo de aula válido" }
  ),

  idSede: z
    .number({
      invalid_type_error: "Debe seleccionar una sede válida",
      required_error: "La sede es obligatoria",
    })
    .int({ message: "El id de la sede debe ser un número entero" }),
});
