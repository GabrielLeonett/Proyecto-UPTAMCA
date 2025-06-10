import z from 'zod'
export const loginSchema = z.object({
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
});