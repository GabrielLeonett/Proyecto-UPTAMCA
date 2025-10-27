import profesorSchema from "./profesor.schema";
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

export default coordinadorSchema;