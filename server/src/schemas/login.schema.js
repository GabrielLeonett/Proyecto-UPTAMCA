import z from "zod";

const loginSchema = z.object({
  email: z
    .string({
      required_error: "auth:validation.email_required|El email es requerido",
      invalid_type_error: "auth:validation.email_invalid_type|El email debe ser texto",
    })
    .email("auth:validation.email_invalid_format|El email no es válido")
    .max(150, "auth:validation.email_max_length|El email no puede exceder 150 caracteres")
    .nonempty("auth:validation.email_empty|El email no puede estar vacío"),

  password: z
    .string({
      required_error: "auth:validation.password_required|La contraseña es requerida",
      invalid_type_error: "auth:validation.password_invalid_type|La contraseña debe ser texto",
    })
    .min(8, "auth:validation.password_min_length|La contraseña debe tener al menos 8 caracteres")
    .max(40, "auth:validation.password_max_length|La contraseña no puede exceder 40 caracteres")
    .regex(/[a-zA-Z]/, "auth:validation.password_letter_required|La contraseña debe contener al menos una letra")
    .regex(/\d/, "auth:validation.password_number_required|La contraseña debe contener al menos un número")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"|,.<>/?-]*$/,
      "auth:validation.password_invalid_chars|La contraseña solo puede contener caracteres alfanuméricos y símbolos especiales"
    )
    .nonempty("auth:validation.password_empty|La contraseña no puede estar vacía"),
});

export default loginSchema;