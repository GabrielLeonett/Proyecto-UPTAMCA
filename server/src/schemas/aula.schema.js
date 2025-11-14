import { z } from "zod";

const aulaSchema = z.object({
  codigo: z
    .string({
      invalid_type_error: "El código debe ser un texto",
      required_error: "El código es obligatorio"
    })
    .min(3, { message: "El código debe tener al menos 3 caracteres" })
    .max(10, { message: "El código no puede tener más de 10 caracteres" })
    .regex(/^[A-Z0-9\-_]+$/, {
      message:
        "El código solo puede contener letras mayúsculas, números, guiones y underscores",
    }),

  tipo: z.enum(
    ["Convencional", "Interactiva", "Computación", "Exterior", "Laboratorio"],
    { 
      required_error: "El tipo de aula es obligatorio",
      invalid_type_error: "Debe seleccionar un tipo de aula válido" 
    }
  ),

  id_sede: z
    .number({
      invalid_type_error: "El ID de la sede debe ser un número",
      required_error: "La sede es obligatoria",
    })
    .int({ message: "El ID de la sede debe ser un número entero" })
    .positive({ message: "El ID de la sede debe ser un número positivo" }),

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

export default aulaSchema;