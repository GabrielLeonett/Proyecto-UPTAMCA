import { profesorSchema } from "./profesor.schema.js";
import z from "zod";

// Esquema principal para Coordinadores
const coordinadorSchema = profesorSchema.extend({
  id_pnf: z
    .number({
      invalid_type_error: "coordinadores:validation.id_pnf_invalid_type|El ID del PNF debe ser un número",
      required_error: "coordinadores:validation.id_pnf_required|El ID del PNF es obligatorio",
    })
    .positive("coordinadores:validation.id_pnf_positive|El ID del PNF debe ser un número positivo"),
});

export const asignarCoordinadorSchema = z.object({
  id_profesor: z
    .number({
      invalid_type_error: "coordinadores:validation.id_profesor_invalid_type|Debe seleccionar un profesor válido",
      required_error: "coordinadores:validation.id_profesor_required|El profesor es obligatorio",
    })
    .int("coordinadores:validation.id_profesor_integer|El ID del profesor debe ser un número entero")
    .positive("coordinadores:validation.id_profesor_positive|El ID del profesor debe ser un número positivo"),

  id_pnf: z
    .number({
      invalid_type_error: "coordinadores:validation.id_pnf_invalid_type|Debe seleccionar un PNF válido",
      required_error: "coordinadores:validation.id_pnf_required|El PNF es obligatorio",
    })
    .int("coordinadores:validation.id_pnf_integer|El ID del PNF debe ser un número entero")
    .positive("coordinadores:validation.id_pnf_positive|El ID del PNF debe ser un número positivo"),
});

export default coordinadorSchema;