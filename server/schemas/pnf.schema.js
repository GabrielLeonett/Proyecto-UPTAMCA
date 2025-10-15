import z from "zod";

export const PNFSchema = z.object({
  nombrePNF: z
    .string({
      invalid_type_error: "El nombre del PNF debe ser un texto",
      required_error: "El nombre del PNF es obligatorio",
    })
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres")
    .regex(
      /^[A-Za-zÁ-ÿ0-9\s\-]+$/,
      "Solo se permiten letras, números, espacios y guiones"
    ),

  descripcionPNF: z
    .string({
      invalid_type_error: "La descripción debe ser un texto",
      required_error: "La descripción es obligatoria",
    })
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(500, "La descripción no puede exceder los 500 caracteres"),

  poblacionPNF: z
    .number({
      invalid_type_error: "La población debe ser un número",
      required_error: "La población estudiantil es obligatoria",
    })
    .int("Debe ser un número entero")
    .positive("La población debe ser un número positivo")
    .max(10000, "La población no puede exceder 10,000 estudiantes")
    .optional(),

  codigoPNF: z
    .string({
      invalid_type_error: "El código debe ser un texto",
      required_error: "El código del PNF es obligatorio",
    })
    .min(3, "El código debe tener mínimo 3 caracteres") // Corregido: mínimo 5
    .max(7, "El código debe tener máximo 5 caracteres") // Corregido: máximo 5
    .regex(
      /^[A-Z]{3}-(?:[A-Z]{1,3}|\d{1,3})$/,
      "Formato inválido. Use AAA-AAA o AAA-913"
    )
    .trim()
    .toUpperCase(),

  sedePNF: z
    .number({
      invalid_type_error: "La sede debe ser un numero",
      required_error: "La sede del PNF es obligatorio",
    })
    .positive("Debe ser un numero positivo"),
});
