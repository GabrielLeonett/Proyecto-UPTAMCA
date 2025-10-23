import { profesorSchema } from "./profesor.schema.js";
import z from "zod";

// Esquema principal para Coordinadores
const coordinadorSchema = profesorSchema.extend({
  id_pnf: z
    .number({
      invalid_type_error: "El ID del Pos-Grado debe ser un número",
      required_error: "El ID del Pos-Grado es obligatorio",
    })
    .positive("El ID del Pos-Grado debe ser un número positivo"),
});

export const asignarCoordinadorSchema = z.object({
  idProfesor: z
    .number({
      invalid_type_error: "Debe seleccionar un profesor válido",
      required_error: "El profesor es obligatorio",
    })
    .int(),

  idPnf: z
    .number({
      invalid_type_error: "Debe seleccionar un PNF válido",
      required_error: "El PNF es obligatorio",
    })
    .int(),
});

export default coordinadorSchema;
