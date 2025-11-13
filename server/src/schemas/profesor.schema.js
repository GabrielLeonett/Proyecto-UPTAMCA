import { z } from "zod";
import userSchema from "./user.schema.js";

// Regex común para validación de texto
const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,()\-]+$/;
const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

// Esquema para Pre-Grados
export const preGradoSchema = z.object({
  id_pre_grado: z
    .number({
      invalid_type_error: "profesores:validation.id_pre_grado_invalid_type|El ID del Pre-Grado debe ser un número",
      required_error: "profesores:validation.id_pre_grado_required|El ID del Pre-Grado es obligatorio",
    })
    .positive("profesores:validation.id_pre_grado_positive|El ID del Pre-Grado debe ser un número positivo")
    .optional(),

  nombre_pre_grado: z
    .string({
      invalid_type_error: "profesores:validation.nombre_pre_grado_invalid_type|El nombre del Pre-Grado debe ser texto",
      required_error: "profesores:validation.nombre_pre_grado_required|El nombre del Pre-Grado es obligatorio",
    })
    .regex(textoRegex, {
      message: "profesores:validation.nombre_pre_grado_invalid_format|El nombre del Pre-Grado solo puede contener letras, espacios y caracteres básicos",
    })
    .optional(),

  tipo_pre_grado: z
    .string({
      invalid_type_error: "profesores:validation.tipo_pre_grado_invalid_type|El tipo del Pre-Grado debe ser texto",
      required_error: "profesores:validation.tipo_pre_grado_required|El tipo del Pre-Grado es obligatorio",
    })
    .regex(soloLetrasRegex, {
      message: "profesores:validation.tipo_pre_grado_invalid_format|El tipo del Pre-Grado solo puede contener letras y espacios",
    })
    .optional(),
});

// Esquema para Pos-Grados
export const posGradoSchema = z.object({
  id_pos_grado: z
    .number({
      invalid_type_error: "profesores:validation.id_pos_grado_invalid_type|El ID del Pos-Grado debe ser un número",
      required_error: "profesores:validation.id_pos_grado_required|El ID del Pos-Grado es obligatorio",
    })
    .positive("profesores:validation.id_pos_grado_positive|El ID del Pos-Grado debe ser un número positivo")
    .optional(),

  nombre_pos_grado: z
    .string({
      invalid_type_error: "profesores:validation.nombre_pos_grado_invalid_type|El nombre del Pos-Grado debe ser texto",
      required_error: "profesores:validation.nombre_pos_grado_required|El nombre del Pos-Grado es obligatorio",
    })
    .regex(textoRegex, {
      message: "profesores:validation.nombre_pos_grado_invalid_format|El nombre del Pos-Grado solo puede contener letras, espacios y caracteres básicos",
    })
    .optional(),

  tipo_pos_grado: z
    .string({
      invalid_type_error: "profesores:validation.tipo_pos_grado_invalid_type|El tipo del Pos-Grado debe ser texto",
      required_error: "profesores:validation.tipo_pos_grado_required|El tipo del Pos-Grado es obligatorio",
    })
    .regex(soloLetrasRegex, {
      message: "profesores:validation.tipo_pos_grado_invalid_format|El tipo del Pos-Grado solo puede contener letras y espacios",
    })
    .optional(),
});

// Esquema para Áreas de Conocimiento
export const areaConocimientoSchema = z.object({
  id_area_conocimiento: z
    .number({
      invalid_type_error: "profesores:validation.id_area_conocimiento_invalid_type|El ID del Área de Conocimiento debe ser un número",
      required_error: "profesores:validation.id_area_conocimiento_required|El ID del Área de Conocimiento es obligatorio",
    })
    .positive("profesores:validation.id_area_conocimiento_positive|El ID del Área de Conocimiento debe ser un número positivo")
    .optional(),

  nombre_area_conocimiento: z
    .string({
      invalid_type_error: "profesores:validation.nombre_area_conocimiento_invalid_type|El área de conocimiento debe ser texto",
      required_error: "profesores:validation.nombre_area_conocimiento_required|El área de conocimiento es obligatoria",
    })
    .regex(soloLetrasRegex, {
      message: "profesores:validation.nombre_area_conocimiento_invalid_format|El área de conocimiento solo puede contener letras y espacios",
    })
    .optional(),
});

// Esquema para crear nueva Área de Conocimiento (sin ID)
export const nuevaAreaConocimientoSchema = z.object({
  area_conocimiento: z
    .string({
      invalid_type_error: "profesores:validation.area_conocimiento_invalid_type|El área de conocimiento debe ser texto",
      required_error: "profesores:validation.area_conocimiento_required|El área de conocimiento es obligatoria",
    })
    .min(1, "profesores:validation.area_conocimiento_min_length|El área de conocimiento no puede estar vacía")
    .regex(soloLetrasRegex, {
      message: "profesores:validation.area_conocimiento_invalid_format|El área de conocimiento solo puede contener letras y espacios",
    }),
});

// Esquema para crear nuevo Pregrado (sin ID)
export const nuevoPregradoSchema = z.object({
  nombre_pre_grado: z
    .string({
      invalid_type_error: "profesores:validation.nombre_pre_grado_invalid_type|El nombre del Pre-Grado debe ser texto",
      required_error: "profesores:validation.nombre_pre_grado_required|El nombre del Pre-Grado es obligatorio",
    })
    .min(1, "profesores:validation.nombre_pre_grado_min_length|El nombre del Pre-Grado no puede estar vacío")
    .regex(textoRegex, {
      message: "profesores:validation.nombre_pre_grado_invalid_format|El nombre del Pre-Grado solo puede contener letras, espacios y caracteres básicos",
    }),

  tipo_pre_grado: z
    .string({
      invalid_type_error: "profesores:validation.tipo_pre_grado_invalid_type|El tipo del Pre-Grado debe ser texto",
      required_error: "profesores:validation.tipo_pre_grado_required|El tipo del Pre-Grado es obligatorio",
    })
    .min(1, "profesores:validation.tipo_pre_grado_min_length|El tipo del Pre-Grado no puede estar vacío")
    .regex(soloLetrasRegex, {
      message: "profesores:validation.tipo_pre_grado_invalid_format|El tipo del Pre-Grado solo puede contener letras y espacios",
    }),
});

// Esquema para crear nuevo Posgrado (sin ID)
export const nuevoPosgradoSchema = z.object({
  nombre_pos_grado: z
    .string({
      invalid_type_error: "profesores:validation.nombre_pos_grado_invalid_type|El nombre del Pos-Grado debe ser texto",
      required_error: "profesores:validation.nombre_pos_grado_required|El nombre del Pos-Grado es obligatorio",
    })
    .min(1, "profesores:validation.nombre_pos_grado_min_length|El nombre del Pos-Grado no puede estar vacío")
    .regex(textoRegex, {
      message: "profesores:validation.nombre_pos_grado_invalid_format|El nombre del Pos-Grado solo puede contener letras, espacios y caracteres básicos",
    }),

  tipo_pos_grado: z
    .string({
      invalid_type_error: "profesores:validation.tipo_pos_grado_invalid_type|El tipo del Pos-Grado debe ser texto",
      required_error: "profesores:validation.tipo_pos_grado_required|El tipo del Pos-Grado es obligatorio",
    })
    .min(1, "profesores:validation.tipo_pos_grado_min_length|El tipo del Pos-Grado no puede estar vacío")
    .regex(soloLetrasRegex, {
      message: "profesores:validation.tipo_pos_grado_invalid_format|El tipo del Pos-Grado solo puede contener letras y espacios",
    }),
});

// Esquema principal para Profesores
export const profesorSchema = userSchema.extend({
  fecha_ingreso: z
    .string({
      required_error: "profesores:validation.fecha_ingreso_required|La fecha de ingreso es obligatoria",
      invalid_type_error: "profesores:validation.fecha_ingreso_invalid_type|La fecha de ingreso debe ser texto",
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, "profesores:validation.fecha_ingreso_invalid_format|La fecha debe tener el formato DD-MM-AAAA")
    .nonempty("profesores:validation.fecha_ingreso_empty|La fecha de ingreso no puede estar vacía"),

  dedicacion: z.enum(
    ["Convencional", "Tiempo Completo", "Medio Tiempo", "Exclusivo"],
    {
      required_error: "profesores:validation.dedicacion_required|La dedicación es obligatoria",
      invalid_type_error: "profesores:validation.dedicacion_invalid_enum|La dedicación debe ser: Convencional, Tiempo Completo, Medio Tiempo o Exclusivo",
    }
  ),

  categoria: z.enum(
    ["Instructor", "Asistente", "Asociado", "Agregado", "Titular"],
    {
      required_error: "profesores:validation.categoria_required|La categoría es obligatoria",
      invalid_type_error: "profesores:validation.categoria_invalid_enum|La categoría debe ser: Instructor, Asistente, Asociado, Agregado o Titular",
    }
  ),

  areas_de_conocimiento: z
    .array(areaConocimientoSchema, {
      required_error: "profesores:validation.areas_conocimiento_required",
    })
    .nonempty("profesores:validation.areas_conocimiento_min_length"),

  pre_grado: z
    .array(preGradoSchema, { 
      required_error: "profesores:validation.pre_grado_required|El Pre-Grado es requerido" 
    })
    .nonempty("profesores:validation.pre_grado_min_length|Debe tener al menos un Pre-grado"),

  pos_grado: z.array(posGradoSchema).optional(),
});