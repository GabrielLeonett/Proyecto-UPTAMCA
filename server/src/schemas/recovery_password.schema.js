// src/schemas/passwordRecovery.schema.js
import { z } from 'zod';

export const passwordRecoverySchema = z.object({
  email: z.string()
    .email("auth:validation.email_invalid_format|El email debe ser válido")
    .min(1, "auth:validation.email_required|El email es requerido"),
  
  token: z.string()
    .min(6, "auth:validation.token_min_length|El token debe tener al menos 6 caracteres")
    .min(1, "auth:validation.token_required|El token es requerido"),
  
  password: z.string()
    .min(8, "auth:validation.password_min_length|La contraseña debe tener al menos 8 caracteres")
    .min(1, "auth:validation.password_required|La nueva contraseña es requerida")
});

export default passwordRecoverySchema;