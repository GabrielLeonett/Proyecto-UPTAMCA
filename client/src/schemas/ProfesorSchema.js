import z from "zod";

export const ProfesorSchema = z.object({
  cedula: z
    .number({
      required_error: "La cédula es requerida",
      invalid_type_error: "La cédula debe ser un número",
    })
    .int("La cédula debe ser un número entero")
    .positive("La cédula debe ser un número positivo")
    .min(100000, "La cédula debe tener al menos 6 dígitos"),

  nombres: z
    .string({
      required_error: "Los nombres son requeridos",
      invalid_type_error: "Los nombres deben ser texto",
    })
    .min(3, "Los nombres deben tener al menos 3 caracteres")
    .max(150, "Los nombres no pueden exceder 150 caracteres")
    .nonempty("Los nombres no pueden estar vacíos"),

  apellidos: z
    .string({
      required_error: "Los apellidos son requeridos",
      invalid_type_error: "Los apellidos deben ser texto",
    })
    .min(3, "Los apellidos deben tener al menos 3 caracteres")
    .max(150, "Los apellidos no pueden exceder 150 caracteres")
    .nonempty("Los apellidos no pueden estar vacíos"),

  email: z
    .string({
      required_error: "El email es requerido",
      invalid_type_error: "El email debe ser texto",
    })
    .email("El email no es válido")
    .max(150, "El email no puede exceder 150 caracteres")
    .nonempty("El email no puede estar vacío"),

  direccion: z
    .string({
      required_error: "La dirección es requerida",
      invalid_type_error: "La dirección debe ser texto",
    })
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(150, "La dirección no puede exceder 150 caracteres")
    .nonempty("La dirección no puede estar vacía"),

  telefono_movil: z
    .string({
      required_error: "El teléfono móvil es requerido",
      invalid_type_error: "El teléfono móvil debe ser texto",
    })
    .regex(/^\d{11}$/, "El teléfono móvil debe tener exactamente 11 dígitos"),

  telefono_local: z
    .string()
    .optional()
    .nullable()
    .refine((valor) => !valor || /^\d{11}$/.test(valor), {
      message: "El teléfono local debe tener exactamente 11 dígitos",
    }),

  fecha_nacimiento: z
    .string({
      required_error: "La fecha de nacimiento es requerida",
      invalid_type_error: "La fecha de nacimiento debe ser texto",
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, "La fecha debe tener el formato DD-MM-AAAA")
    .nonempty("La fecha de nacimiento no puede estar vacía"),

  genero: z
    .enum(["masculino", "femenino"], {
      required_error: "El género es requerido",
      invalid_type_error: "El género debe ser 'masculino' o 'femenino'",
    })
    .refine((val) => val !== undefined && val !== "", {
      message: "Debe seleccionar un género válido",
    }),
  fecha_ingreso: z
    .string({
      required_error: "La fecha de ingreso es requerida",
      invalid_type_error: "La fecha de ingreso debe ser texto",
    })
    .regex(
      /^\d{2}-\d{2}-\d{4}$/,
      "La fecha de ingreso debe tener el formato DD-MM-AAAA"
    )
    .nonempty("La fecha de ingreso no puede estar vacía"),

  dedicacion: z.enum(
    ["Convencional", "Tiempo Completo", "Medio Tiempo", "Exclusivo"],
    {
      required_error: "La dedicación es requerida",
      invalid_type_error:
        "La dedicación debe ser: Convencional, Tiempo Completo, Medio Tiempo o Exclusivo",
    }
  ),

  ubicacion: z.enum(
    [
      "Núcleo de Salud y Deporte",
      "Núcleo de Tecnología y Ciencias Administrativas",
      "Núcleo de Humanidades y Ciencias Sociales",
    ],
    {
      required_error: "La ubicación es requerida",
      invalid_type_error:
        "La ubicación debe ser: Núcleo de Salud y Deporte, Núcleo de Tecnología y Ciencias Administrativas o Núcleo de Humanidades y Ciencias Sociales",
    }
  ),

  categoria: z.enum(
    ["Instructor", "Asistente", "Asociado", "Agregado", "Titular"],
    {
      required_error: "La categoría es requerida",
      invalid_type_error:
        "La categoría debe ser: Instructor, Asistente, Asociado, Agregado o Titular",
    }
  ),

  area_de_conocimiento: z
    .string({
      required_error: "El área de conocimiento es requerida",
      invalid_type_error: "El área de conocimiento debe ser texto",
    })
    .min(3, "El área de conocimiento debe tener al menos 3 caracteres")
    .max(150, "El área de conocimiento no puede exceder 150 caracteres")
    .nonempty("El área de conocimiento no puede estar vacía"),

  pre_grado: z
    .string({
      required_error: "El pregrado es requerido",
      invalid_type_error: "El pregrado debe ser texto",
    })
    .min(3, "El pregrado debe tener al menos 3 caracteres")
    .max(150, "El pregrado no puede exceder 150 caracteres")
    .nonempty("El pregrado no puede estar vacío"),

  pos_grado: z
    .string({
      required_error: "El posgrado es requerido",
      invalid_type_error: "El posgrado debe ser texto",
    })
    .min(3, "El posgrado debe tener al menos 3 caracteres")
    .max(150, "El posgrado no puede exceder 150 caracteres")
    .nonempty("El posgrado no puede estar vacío"),
});
