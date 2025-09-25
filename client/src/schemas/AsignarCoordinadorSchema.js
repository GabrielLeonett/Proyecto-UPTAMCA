import { z } from "zod";

export const AsignarCoordinadorSchema = z.object({
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
