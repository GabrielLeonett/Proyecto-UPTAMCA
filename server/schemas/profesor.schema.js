import { z } from "zod";
import userSchema from "./user.schema.js";

// Esquema para Pre-Grados
export const preGradoSchema = z.object({
  id_pre_grado: z
    .number({
      invalid_type_error: "El ID del Pre-Grado debe ser un número",
      required_error: "El ID del Pre-Grado es obligatorio",
    })
    .positive("El ID del Pre-Grado debe ser un número positivo")
    .optional(),

  nombre_pre_grado: z.string({
    invalid_type_error: "El nombre del Pre-Grado debe ser texto",
    required_error: "El nombre del Pre-Grado es obligatorio",
  }).optional(),

  tipo_pre_grado: z.string({
    invalid_type_error: "El tipo del Pre-Grado debe ser texto",
    required_error: "El tipo del Pre-Grado es obligatorio",
  }).optional(),
});

// Esquema para Pos-Grados
export const posGradoSchema = z.object({
  id_pos_grado: z
    .number({
      invalid_type_error: "El ID del Pos-Grado debe ser un número",
      required_error: "El ID del Pos-Grado es obligatorio",
    })
    .positive("El ID del Pos-Grado debe ser un número positivo")
    .optional(),

  nombre_pos_grado: z
    .string({
      invalid_type_error: "El nombre del Pos-Grado debe ser texto",
      required_error: "El nombre del Pos-Grado es obligatorio",
    })
    .optional(),

  tipo_pos_grado: z
    .string({
      invalid_type_error: "El tipo del Pos-Grado debe ser texto",
      required_error: "El tipo del Pos-Grado es obligatorio",
    })
    .optional(),
});

// Esquema para Áreas de Conocimiento
export const areaConocimientoSchema = z.object({
  id_area_conocimiento: z
    .number({
      invalid_type_error: "El ID del Área de Conocimiento debe ser un número",
      required_error: "El ID del Área de Conocimiento es obligatorio",
    })
    .positive("El ID del Área de Conocimiento debe ser un número positivo")
    .optional(),

  area_conocimiento: z
    .string({
      invalid_type_error: "El área de conocimiento debe ser texto",
      required_error: "El área de conocimiento es obligatoria",
    })
    .optional(),
});

// Esquema para crear nueva Área de Conocimiento (sin ID)
export const nuevaAreaConocimientoSchema = z.object({
  area_conocimiento: z
    .string({
      invalid_type_error: "El área de conocimiento debe ser texto",
      required_error: "El área de conocimiento es obligatoria",
    })
    .min(1, "El área de conocimiento no puede estar vacía"),
});

// Esquema para crear nuevo Pregrado (sin ID)
export const nuevoPregradoSchema = z.object({
  nombre: z
    .string({
      invalid_type_error: "El nombre del Pre-Grado debe ser texto",
      required_error: "El nombre del Pre-Grado es obligatorio",
    })
    .min(1, "El nombre del Pre-Grado no puede estar vacío"),

  tipo: z
    .string({
      invalid_type_error: "El tipo del Pre-Grado debe ser texto",
      required_error: "El tipo del Pre-Grado es obligatorio",
    })
    .min(1, "El tipo del Pre-Grado no puede estar vacío"),
});

// Esquema para crear nuevo Posgrado (sin ID)
export const nuevoPosgradoSchema = z.object({
  nombre: z
    .string({
      invalid_type_error: "El nombre del Pos-Grado debe ser texto",
      required_error: "El nombre del Pos-Grado es obligatorio",
    })
    .min(1, "El nombre del Pos-Grado no puede estar vacío"),

  tipo: z
    .string({
      invalid_type_error: "El tipo del Pos-Grado debe ser texto",
      required_error: "El tipo del Pos-Grado es obligatorio",
    })
    .min(1, "El tipo del Pos-Grado no puede estar vacío"),
});

// Esquema principal para Profesores
export const profesorSchema = userSchema.extend({
  fecha_ingreso: z
    .string({
      required_error: "La fecha de ingreso es obligatoria",
      invalid_type_error: "La fecha de ingreso debe ser texto",
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, "La fecha debe tener el formato DD-MM-AAAA")
    .nonempty("La fecha de ingreso no puede estar vacía"),

  dedicacion: z.enum(
    ["Convencional", "Tiempo Completo", "Medio Tiempo", "Exclusivo"],
    {
      required_error: "La dedicación es obligatoria",
      invalid_type_error:
        "La dedicación debe ser: Convencional, Tiempo Completo, Medio Tiempo o Exclusivo",
    }
  ),

  categoria: z.enum(
    ["Instructor", "Asistente", "Asociado", "Agregado", "Titular"],
    {
      required_error: "La categoría es obligatoria",
      invalid_type_error:
        "La categoría debe ser: Instructor, Asistente, Asociado, Agregado o Titular",
    }
  ),

  areas_de_conocimiento: z
    .array(
      z.string({
        required_error: "El Área de conocimiento es requerida",
        invalid_type_error: "El área de conocimiento debe ser texto",
      }),
      { required_error: "El Área de conocimiento es requerida" }
    )
    .nonempty("Debe tener al menos un área de conocimiento"),

  pre_grado: z
    .array(preGradoSchema, { required_error: "El Pre-Grado es requerido" })
    .nonempty("Debe tener al menos un Pre-grado"),

  pos_grado: z.array(posGradoSchema).optional(),
});
