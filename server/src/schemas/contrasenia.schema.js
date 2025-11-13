import z from "zod";

const contraseniaSchema = z.object({
  antigua_password: z
    .string({
      required_error: "auth:validation.antigua_password_required|La contraseña actual es requerida",
      invalid_type_error: "auth:validation.antigua_password_invalid_type|La contraseña actual debe ser texto",
    })
    .min(8, "auth:validation.password_min_length|La contraseña debe tener al menos 8 caracteres")
    .max(40, "auth:validation.password_max_length|La contraseña no puede exceder 40 caracteres")
    .regex(/[a-zA-Z]/, "auth:validation.password_letter_required|La contraseña debe contener al menos una letra")
    .regex(/\d/, "auth:validation.password_number_required|La contraseña debe contener al menos un número")
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"|,.<>/?-]*$/, "auth:validation.password_invalid_chars|La contraseña solo puede contener caracteres alfanuméricos y símbolos especiales")
    .nonempty("auth:validation.password_empty|La contraseña no puede estar vacía"),

  password: z
    .string({
      required_error: "auth:validation.password_required|La nueva contraseña es requerida",
      invalid_type_error: "auth:validation.password_invalid_type|La nueva contraseña debe ser texto",
    })
    .min(8, "auth:validation.password_min_length|La contraseña debe tener al menos 8 caracteres")
    .max(40, "auth:validation.password_max_length|La contraseña no puede exceder 40 caracteres")
    .regex(/[a-zA-Z]/, "auth:validation.password_letter_required|La contraseña debe contener al menos una letra")
    .regex(/\d/, "auth:validation.password_number_required|La contraseña debe contener al menos un número")
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"|,.<>/?-]*$/, "auth:validation.password_invalid_chars|La contraseña solo puede contener caracteres alfanuméricos y símbolos especiales")
    .nonempty("auth:validation.password_empty|La contraseña no puede estar vacía"),
  
  repetir_password: z
    .string({
      required_error: "auth:validation.repetir_password_required|Debes repetir la contraseña",
      invalid_type_error: "auth:validation.repetir_password_invalid_type|La contraseña de confirmación debe ser texto",
    })
    .optional()
})
.refine((data) => data.password === data.repetir_password, {
  message: "auth:validation.passwords_mismatch|Las contraseñas no coinciden",
  path: ["repetir_password"],
});

export default contraseniaSchema;