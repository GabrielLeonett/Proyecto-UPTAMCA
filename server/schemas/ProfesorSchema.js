import { z } from "zod";
import { UserSchema } from "./UserSchema.js";

// Esquema para Pre-Grados
const preGradoSchema = z.object({
  id_pre_grado: z
    .number({
      invalid_type_error: "El ID del Pre-Grado debe ser un número",
      required_error: "El ID del Pre-Grado es obligatorio",
    })
    .positive("El ID del Pre-Grado debe ser un número positivo"),

  nombre_pre_grado: z.string({
    invalid_type_error: "El nombre del Pre-Grado debe ser texto",
    required_error: "El nombre del Pre-Grado es obligatorio",
  }),

  tipo_pre_grado: z.string({
    invalid_type_error: "El tipo del Pre-Grado debe ser texto",
    required_error: "El tipo del Pre-Grado es obligatorio",
  }),
});

// Esquema para Pos-Grados
const posGradoSchema = z.object({
  id_pos_grado: z
    .number({
      invalid_type_error: "El ID del Pos-Grado debe ser un número",
      required_error: "El ID del Pos-Grado es obligatorio",
    })
    .positive("El ID del Pos-Grado debe ser un número positivo"),

  nombre_pos_grado: z.string({
    invalid_type_error: "El nombre del Pos-Grado debe ser texto",
    required_error: "El nombre del Pos-Grado es obligatorio",
  }),

  tipo_pos_grado: z.string({
    invalid_type_error: "El tipo del Pos-Grado debe ser texto",
    required_error: "El tipo del Pos-Grado es obligatorio",
  }),
});

// Esquema principal para Profesores
const ProfesorSchema = UserSchema.extend({
  cedula: z
    .number({
      required_error: "La cédula es obligatoria",
      invalid_type_error: "La cédula debe ser un número",
    })
    .int("La cédula debe ser un número entero")
    .positive("La cédula debe ser un número positivo")
    .min(500000, "La cédula debe tener al menos 6 dígitos"),

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

  area_de_conocimiento: z
    .array(
      z
        .string({
          required_error: "El Área de conocimiento es requerida",
          invalid_type_error: "El área de conocimiento debe ser texto"
        })
    ,{required_error: "El Área de conocimiento es requerida"})
    .nonempty("Debe tener al menos un área de conocimiento"),

  pre_grado: z
    .array(preGradoSchema, { required_error: "El Pre-Grado es requerido" })
    .nonempty("Debe tener al menos un Pre-grado"),

  pos_grado: z.array(posGradoSchema).optional(),
});

// Función para validar un profesor completo
export const validationProfesor = (input) => {
  return ProfesorSchema.safeParse(input);
};

// Función para validar un profesor parcial (actualizaciones)
export const validationPartialProfesor = (input) => {
  return ProfesorSchema.partial().safeParse(input);
};
