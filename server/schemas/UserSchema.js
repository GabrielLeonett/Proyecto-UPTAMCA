import z from "zod";

const UserSchema = z.object({
  cedula: z
    .number({
      required_error: "La cédula es requerida",
      invalid_type_error: "La cédula debe ser un número"
    })
    .int("La cédula debe ser un número entero")
    .positive("La cédula debe ser un número positivo")
    .min(500000, "La cédula debe tener al menos 6 dígitos"),
    
  nombres: z
    .string({
      required_error: "Los nombres son requeridos",
      invalid_type_error: "Los nombres deben ser texto"
    })
    .min(3, "Los nombres deben tener al menos 3 caracteres")
    .max(150, "Los nombres no pueden exceder 150 caracteres")
    .nonempty("Los nombres no pueden estar vacíos"),
    
  apellidos: z
    .string({
      required_error: "Los apellidos son requeridos",
      invalid_type_error: "Los apellidos deben ser texto"
    })
    .min(3, "Los apellidos deben tener al menos 3 caracteres")
    .max(150, "Los apellidos no pueden exceder 150 caracteres")
    .nonempty("Los apellidos no pueden estar vacíos"),
    
  email: z
    .string({
      required_error: "El email es requerido",
      invalid_type_error: "El email debe ser texto"
    })
    .email("El email no es válido")
    .max(150, "El email no puede exceder 150 caracteres")
    .nonempty("El email no puede estar vacío"),
    
  password: z
    .string({
      required_error: "La contraseña es requerida",
      invalid_type_error: "La contraseña debe ser texto"
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(40, "La contraseña no puede exceder 40 caracteres")
    .nonempty("La contraseña no puede estar vacía"),
    
  direccion: z
    .string({
      required_error: "La dirección es requerida",
      invalid_type_error: "La dirección debe ser texto"
    })
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(150, "La dirección no puede exceder 150 caracteres")
    .nonempty("La dirección no puede estar vacía"),
    
  telefono_movil: z
    .string({
      required_error: "El teléfono móvil es requerido",
      invalid_type_error: "El teléfono móvil debe ser texto"
    })
    .regex(/^\d{11}$/, "El teléfono móvil debe tener exactamente 11 dígitos"),
    
  telefono_local: z
    .string()
    .regex(/^\d{10}$/, "El teléfono local debe tener exactamente 10 dígitos")
    .optional()
    .nullable(),
    
  fecha_nacimiento: z
    .string({
      required_error: "La fecha de nacimiento es requerida",
      invalid_type_error: "La fecha de nacimiento debe ser texto"
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, "La fecha debe tener el formato DD-MM-AAAA")
    .nonempty("La fecha de nacimiento no puede estar vacía"),
    
  genero: z.enum(["masculino", "femenino"], {
    required_error: "El género es requerido",
    invalid_type_error: "El género debe ser 'masculino' o 'femenino'"
  })
});

export const validationUser = ({input}) => {
  return UserSchema.safeParse(input);
};

export const validationPartialUser = ({input}) => {
  return UserSchema.partial().safeParse(input);
};