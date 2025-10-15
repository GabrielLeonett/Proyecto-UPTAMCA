import { ProfesorSchema } from "./ProfesorSchema.js";
import z from "zod";

// Esquema principal para Coordinadores
export const CoordinadorSchema = ProfesorSchema.extend({
  id_pnf: z
    .number({
      invalid_type_error: "El ID del Pos-Grado debe ser un número",
      required_error: "El ID del Pos-Grado es obligatorio",
    })
    .positive("El ID del Pos-Grado debe ser un número positivo"),
});
