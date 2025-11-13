import { z } from "zod";

const aulaSchema = z.object({
  codigo: z
    .string({
      invalid_type_error: "aulas:validation.codigo_invalid_type",
      required_error: "aulas:validation.codigo_required"
    })
    .min(3, { 
      // CLAVE PURA: Zod-i18n enviará { minimum: 3 } a i18next.
      message: "aulas:validation.codigo_min_length" 
    })
    .max(10, { 
      // CLAVE PURA: Zod-i18n enviará { maximum: 10 } a i18next.
      message: "aulas:validation.codigo_max_length" 
    })
    .regex(/^[A-Z0-9\-_]+$/, {
      message: "aulas:validation.codigo_invalid_format", // CLAVE PURA
    }),

  tipo: z
  .string({
    invalid_type_error: "aulas:validation.tipo_invalid_type",
    required_error: "aulas:validation.tipo_required"
  })
  .refine(
    (val) => ["Convencional", "Interactiva", "Computación", "Exterior", "Laboratorio"].includes(val),
    {
      message: "aulas:validation.tipo_invalid"
    }
  ),

  id_sede: z
    .number({
      invalid_type_error: "aulas:validation.id_sede_invalid_type",
      required_error: "aulas:validation.id_sede_required"
    })
    .int({ 
      message: "aulas:validation.id_sede_invalid_int" // CLAVE PURA
    })
    .positive({ 
      message: "aulas:validation.id_sede_positive" // CLAVE PURA
    }),

  capacidad: z
    .number({
      invalid_type_error: "aulas:validation.capacidad_invalid_type",
      required_error: "aulas:validation.capacidad_required"
    })
    .int({ 
      message: "aulas:validation.capacidad_invalid_int" // CLAVE PURA
    })
    .min(8, { 
      // CLAVE PURA: Zod-i18n enviará { minimum: 1 } a i18next.
      message: "aulas:validation.capacidad_min" 
    })
    .max(30, { 
      // CLAVE PURA: Zod-i18n enviará { maximum: 500 } a i18next.
      message: "aulas:validation.capacidad_max" 
    })
    .positive({ 
      message: "aulas:validation.capacidad_positive" // CLAVE PURA
    }),
    
  // ... (otros campos)
});

export default aulaSchema;