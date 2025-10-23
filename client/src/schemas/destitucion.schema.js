import { z } from "zod";

// Schema corregido
const destitucionSchema = z.object({
  id_profesor: z.number({
    required_error: "El ID del profesor es requerido",
    invalid_type_error: "El ID del profesor debe ser un número"
  }).int().positive("El ID del profesor debe ser un número positivo"),
  
  tipo_accion: z.enum(['DESTITUCION', 'ELIMINACION', 'RENUNCIA', 'RETIRO'], {
    required_error: "El tipo de acción es requerido",
    invalid_type_error: "Tipo de acción debe ser: DESTITUCION, ELIMINACION, RENUNCIA o RETIRO"
  }),
  
  razon: z.string({
    required_error: "La razón es requerida"
  }).min(10, "La razón debe tener al menos 10 caracteres")
    .max(1000, "La razón no puede exceder 1000 caracteres"),
  
  observaciones: z.string()
    .max(2000, "Las observaciones no pueden exceder 2000 caracteres")
    .optional()
    .nullable()
    .default(null),
  
  fecha_efectiva: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
    .optional()
    .nullable()
    .default(null)
});

export default destitucionSchema;