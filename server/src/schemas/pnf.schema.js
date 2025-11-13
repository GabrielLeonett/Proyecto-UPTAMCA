import z from "zod";

const pnfSchema = z.object({
  nombre_pnf: z
    .string({
      invalid_type_error: "pnf:validation.nombre_pnf_invalid_type|El nombre del PNF debe ser un texto",
      required_error: "pnf:validation.nombre_pnf_required|El nombre del PNF es obligatorio",
    })
    .min(5, "pnf:validation.nombre_pnf_min_length|El nombre debe tener al menos 5 caracteres")
    .max(100, "pnf:validation.nombre_pnf_max_length|El nombre no puede exceder los 100 caracteres")
    .regex(
      /^[A-Za-zÁ-ÿ0-9\s\-]+$/,
      "pnf:validation.nombre_pnf_invalid_format|Solo se permiten letras, números, espacios y guiones"
    ),

  descripcion_pnf: z
    .string({
      invalid_type_error: "pnf:validation.descripcion_pnf_invalid_type|La descripción debe ser un texto",
      required_error: "pnf:validation.descripcion_pnf_required|La descripción es obligatoria",
    })
    .min(20, "pnf:validation.descripcion_pnf_min_length|La descripción debe tener al menos 20 caracteres")
    .max(500, "pnf:validation.descripcion_pnf_max_length|La descripción no puede exceder los 500 caracteres"),

  poblacion_pnf: z
    .number({
      invalid_type_error: "pnf:validation.poblacion_pnf_invalid_type|La población debe ser un número",
      required_error: "pnf:validation.poblacion_pnf_required|La población estudiantil es obligatoria",
    })
    .int("pnf:validation.poblacion_pnf_integer|Debe ser un número entero")
    .positive("pnf:validation.poblacion_pnf_positive|La población debe ser un número positivo")
    .max(10000, "pnf:validation.poblacion_pnf_max|La población no puede exceder 10,000 estudiantes")
    .optional(),

  codigo_pnf: z
    .string({
      invalid_type_error: "pnf:validation.codigo_pnf_invalid_type|El código debe ser un texto",
      required_error: "pnf:validation.codigo_pnf_required|El código del PNF es obligatorio",
    })
    .min(3, "pnf:validation.codigo_pnf_min_length|El código debe tener mínimo 3 caracteres")
    .max(7, "pnf:validation.codigo_pnf_max_length|El código debe tener máximo 7 caracteres")
    .regex(
      /^[A-Z]{3}-(?:[A-Z]{1,3}|\d{1,3})$/,
      "pnf:validation.codigo_pnf_invalid_format|Formato inválido. Use AAA-AAA o AAA-913"
    )
    .trim()
    .toUpperCase(),

  duracion_trayectos_pnf: z
    .number({
      invalid_type_error: "pnf:validation.duracion_trayectos_invalid_type|La duración debe ser un número",
      required_error: "pnf:validation.duracion_trayectos_required|La duración de los trayectos es obligatoria",
    })
    .min(1, "pnf:validation.duracion_trayectos_min|La duración mínima es 1 trayecto")
    .max(5, "pnf:validation.duracion_trayectos_max|La duración máxima es 5 trayectos"),

  sede_pnf: z
    .number({
      invalid_type_error: "pnf:validation.sede_pnf_invalid_type|La sede debe ser un numero",
      required_error: "pnf:validation.sede_pnf_required|La sede del PNF es obligatorio",
    })
    .positive("pnf:validation.sede_pnf_positive|Debe ser un numero positivo"),
});

export default pnfSchema;