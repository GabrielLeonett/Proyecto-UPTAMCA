import { z } from "zod";
import userSchema from "./user.schema.js";

const rolSchema = z.object({
  id_rol: z.number({
    required_error: 'admins:validation.id_rol_required|El id del rol es requerido',
    invalid_type_error: 'admins:validation.id_rol_invalid_type|El id del rol debe ser un número'
  }),
  nombre_rol: z.string({
    required_error: 'admins:validation.nombre_rol_required|El nombre del rol es requerido',
    invalid_type_error: 'admins:validation.nombre_rol_invalid_type|El nombre del rol debe ser un texto'
  }).min(1, 'admins:validation.nombre_rol_min_length|El nombre del rol no puede estar vacío')
});

const adminSchema = userSchema.extend({
  roles: z.array(rolSchema).min(1, 'admins:validation.roles_min_length|Debe tener al menos un rol')
});

export default adminSchema;