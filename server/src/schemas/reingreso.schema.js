import { z } from "zod";

// Schema para reingreso con internacionalización
const reingresoSchema = z.object({
  id_profesor: z.number({
    required_error: "reingresos:validation.id_profesor_required|El ID del profesor es requerido",
    invalid_type_error: "reingresos:validation.id_profesor_invalid_type|El ID del profesor debe ser un número"
  })
  .int("reingresos:validation.id_profesor_integer|El ID del profesor debe ser un número entero")
  .positive("reingresos:validation.id_profesor_positive|El ID del profesor debe ser un número positivo"),
  
  tipo_reingreso: z.enum(['REINGRESO', 'REINCORPORACION', 'REINTEGRO'], {
    required_error: "reingresos:validation.tipo_reingreso_required|El tipo de reingreso es requerido",
    invalid_type_error: "reingresos:validation.tipo_reingreso_invalid_enum|Tipo de reingreso debe ser: REINGRESO, REINCORPORACION o REINTEGRO"
  }),
  
  motivo_reingreso: z.string({
    required_error: "reingresos:validation.motivo_reingreso_required|El motivo de reingreso es requerido",
    invalid_type_error: "reingresos:validation.motivo_reingreso_invalid_type|El motivo de reingreso debe ser un texto"
  })
  .min(10, "reingresos:validation.motivo_reingreso_min_length|El motivo de reingreso debe tener al menos 10 caracteres")
  .max(1000, "reingresos:validation.motivo_reingreso_max_length|El motivo de reingreso no puede exceder 1000 caracteres"),
  
  observaciones: z.string({
    invalid_type_error: "reingresos:validation.observaciones_invalid_type|Las observaciones deben ser un texto"
  })
  .max(2000, "reingresos:validation.observaciones_max_length|Las observaciones no pueden exceder 2000 caracteres")
  .optional()
  .nullable()
  .default(null),
  
  fecha_efectiva: z.string({
    invalid_type_error: "reingresos:validation.fecha_efectiva_invalid_type|La fecha efectiva debe ser un texto"
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "reingresos:validation.fecha_efectiva_invalid_format|Formato de fecha inválido (YYYY-MM-DD)")
  .optional()
  .nullable()
  .default(null),
  
  registro_anterior_id: z.number({
    invalid_type_error: "reingresos:validation.registro_anterior_id_invalid_type|El ID del registro anterior debe ser un número"
  })
  .int("reingresos:validation.registro_anterior_id_integer|El ID del registro anterior debe ser un número entero")
  .positive("reingresos:validation.registro_anterior_id_positive|El ID del registro anterior debe ser un número positivo")
  .optional()
  .nullable()
  .default(null)
});

export default reingresoSchema;