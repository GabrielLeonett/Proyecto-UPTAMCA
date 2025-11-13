import { z } from "zod";

const sedeSchema = z.object({
  nombre_sede: z
    .string({
      invalid_type_error: "sedes:validation.nombre_sede_invalid_type|El nombre de la sede debe ser un texto",
      required_error: "sedes:validation.nombre_sede_required|El nombre de la sede es obligatorio",
    })
    .min(3, {
      message: "sedes:validation.nombre_sede_min_length|El nombre de la sede debe tener al menos 3 caracteres",
    })
    .max(100, {
      message: "sedes:validation.nombre_sede_max_length|El nombre de la sede debe tener como máximo 100 caracteres",
    })
    .regex(/^[A-Za-zÁ-ÿ0-9\s\-()]+$/, {
      message: "sedes:validation.nombre_sede_invalid_format|El nombre de la sede solo puede contener letras, números, espacios y caracteres básicos",
    }),

  ubicacion_sede: z
    .string({
      invalid_type_error: "sedes:validation.ubicacion_sede_invalid_type|La ubicación de la sede debe ser un texto",
      required_error: "sedes:validation.ubicacion_sede_required|La ubicación de la sede es obligatoria",
    })
    .min(5, {
      message: "sedes:validation.ubicacion_sede_min_length|La ubicación de la sede debe tener al menos 5 caracteres",
    })
    .max(200, {
      message: "sedes:validation.ubicacion_sede_max_length|La ubicación de la sede debe tener como máximo 200 caracteres",
    }),

  google_sede: z
    .string({
      invalid_type_error: "sedes:validation.google_sede_invalid_type|El enlace de Google Maps debe ser un texto",
      required_error: "sedes:validation.google_sede_required|El enlace de Google Maps es obligatorio",
    })
    .url({ message: "sedes:validation.google_sede_invalid_url|El enlace de Google Maps debe ser una URL válida" })
    .max(300, {
      message: "sedes:validation.google_sede_max_length|El enlace de Google Maps debe tener como máximo 300 caracteres",
    })
    .regex(/^https:\/\/goo\.gl\/maps\/|^https:\/\/maps\.app\.goo\.gl\/|^https:\/\/www\.google\.com\/maps\/|^https:\/\/maps\.google\.com\//, {
      message: "sedes:validation.google_sede_invalid_domain|El enlace debe ser de Google Maps",
    }),

  ciudad_sede: z.enum(["Los Teques", "Carrizal", "San Antonio de los Altos"], {
    invalid_type_error: "sedes:validation.ciudad_sede_invalid_enum|La ciudad de la sede debe ser una de las opciones predefinidas",
    required_error: "sedes:validation.ciudad_sede_required|La ciudad de la sede es obligatoria",
  }),

  telefono_sede: z
    .string({
      invalid_type_error: "sedes:validation.telefono_sede_invalid_type|El teléfono de la sede debe ser un texto",
    })
    .regex(/^\+?[\d\s\-\(\)]+$/, {
      message: "sedes:validation.telefono_sede_invalid_format|El formato del teléfono no es válido",
    })
    .max(20, {
      message: "sedes:validation.telefono_sede_max_length|El teléfono debe tener como máximo 20 caracteres",
    })
    .optional()
    .nullable()
    .default(null),

  estado_sede: z.enum(["activo", "inactivo", "mantenimiento"], {
    invalid_type_error: "sedes:validation.estado_sede_invalid_enum|El estado de la sede debe ser: activo, inactivo o mantenimiento",
    required_error: "sedes:validation.estado_sede_required|El estado de la sede es obligatorio",
  }).default("activo"),

  capacidad_maxima: z
    .number({
      invalid_type_error: "sedes:validation.capacidad_maxima_invalid_type|La capacidad máxima debe ser un número",
    })
    .int("sedes:validation.capacidad_maxima_integer|La capacidad máxima debe ser un número entero")
    .min(50, "sedes:validation.capacidad_maxima_min|La capacidad mínima es 50 estudiantes")
    .max(5000, "sedes:validation.capacidad_maxima_max|La capacidad máxima es 5000 estudiantes")
    .positive("sedes:validation.capacidad_maxima_positive|La capacidad debe ser un número positivo")
    .optional()
    .default(500)
});

export default sedeSchema;