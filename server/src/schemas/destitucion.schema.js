import { z } from "zod";

// Schema corregido con internacionalización
const destitucionSchema = z.object({
  id_profesor: z.number({
    required_error: "destituciones:validation.id_profesor_required|El ID del profesor es requerido",
    invalid_type_error: "destituciones:validation.id_profesor_invalid_type|El ID del profesor debe ser un número"
  })
  .int("destituciones:validation.id_profesor_integer|El ID del profesor debe ser un número entero")
  .positive("destituciones:validation.id_profesor_positive|El ID del profesor debe ser un número positivo"),
  
  tipo_accion: z.enum(['DESTITUCION', 'ELIMINACION', 'RENUNCIA', 'RETIRO'], {
    required_error: "destituciones:validation.tipo_accion_required|El tipo de acción es requerido",
    invalid_type_error: "destituciones:validation.tipo_accion_invalid_enum|Tipo de acción debe ser: DESTITUCION, ELIMINACION, RENUNCIA o RETIRO"
  }),
  
  razon: z.string({
    required_error: "destituciones:validation.razon_required|La razón es requerida",
    invalid_type_error: "destituciones:validation.razon_invalid_type|La razón debe ser un texto"
  })
  .min(10, "destituciones:validation.razon_min_length|La razón debe tener al menos 10 caracteres")
  .max(1000, "destituciones:validation.razon_max_length|La razón no puede exceder 1000 caracteres"),
  
  observaciones: z.string({
    invalid_type_error: "destituciones:validation.observaciones_invalid_type|Las observaciones deben ser un texto"
  })
  .max(2000, "destituciones:validation.observaciones_max_length|Las observaciones no pueden exceder 2000 caracteres")
  .optional()
  .nullable()
  .default(null),
  
  fecha_efectiva: z.string({
    invalid_type_error: "destituciones:validation.fecha_efectiva_invalid_type|La fecha efectiva debe ser un texto"
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "destituciones:validation.fecha_efectiva_invalid_format|Formato de fecha inválido (YYYY-MM-DD)")
  .optional()
  .nullable()
  .default(null)
});

export default destitucionSchema;