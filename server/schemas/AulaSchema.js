import { z } from "zod";

export const AulaSchema = z.object({
  codigo: z
    .string()
    .min(3, { message: "El código debe tener al menos 3 caracteres" })
    .max(10, { message: "El código no puede tener más de 10 caracteres" })
    .nonempty({ message: "El código es obligatorio" })
    .regex(/^[A-Z0-9\-_]+$/, {
      message:
        "El código solo puede contener letras mayúsculas, números, guiones y underscores",
    }),

  tipo: z.enum(
    ["Convencional", "Interactiva", "Computación", "Exterior", "Laboratorio"],
    { message: "Debe seleccionar un tipo de aula válido" }
  ),

  id_sede: z
    .number({
      invalid_type_error: "Debe seleccionar una sede válida",
      required_error: "La sede es obligatoria",
    })
    .int({ message: "El id de la sede debe ser un número entero" })
    .positive({ message: "El id de la sede debe ser un número positivo" }),

  // ✅ AGREGAR: Validación para capacidad_aula
  capacidad: z
    .number({
      invalid_type_error: "La capacidad debe ser un número",
      required_error: "La capacidad es obligatoria",
    })
    .int({ message: "La capacidad debe ser un número entero" })
    .min(1, { message: "La capacidad mínima es 1 estudiante" })
    .max(500, { message: "La capacidad máxima es 500 estudiantes" })
    .positive({ message: "La capacidad debe ser un número positivo" }),
});

// Validación completa
export const validationAula = ({ input }) => {
  const validationResult = AulaSchema.safeParse(input);
  return validationResult;
};

// Validación parcial (para actualizaciones)
export const validationPartialAula = ({ input }) => {
  const PartialAulaSchema = AulaSchema.partial().safeParse(input);
  return PartialAulaSchema;
};
