import z from "zod";

const unidadcurricularSchema = z.object({
  idTrayecto: z
    .number({
      invalid_type_error: "El id de trayecto tiene que se un numero",
      required_error: "El id de trayecto es obligatorio",
    })
    .positive("El id tiene que se positivo")
    .optional(),

  nombreUnidadCurricular: z
    .string({
      invalid_type_error: "El nombre del Unidad Curricular debe ser un texto",
      required_error: "El nombre del Unidad Curricular es obligatorio",
    })
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(40, "El nombre no puede exceder los 40 caracteres")
    .regex(
      /^[A-Za-zÁ-ÿ0-9\s\-]+$/,
      "Solo se permiten letras, números, espacios y guiones"
    ),

  descripcionUnidadCurricular: z
    .string({
      invalid_type_error: "La descripción debe ser un texto",
      required_error: "La descripción es obligatoria",
    })
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(200, "La descripción no puede exceder los 200 caracteres"),

  cargaHorasAcademicas: z
    .number({
      invalid_type_error:
        "La carga de horas de la unidad curricular debe ser un numero",
      required_error:
        "La carga de horas de la unidad curricular es obligatoria",
    })
    .min(2, "Lo minimo son 2 horas de 45min.")
    .max(4, "Lo maximo son 5 horas de 45min.")
    .positive(
      "La carga de horas de la unidad curricular debe ser un numero positivo"
    ),

  codigoUnidadCurricular: z
    .string({
      invalid_type_error: "El código debe ser un texto",
      required_error: "El código del Unidad Curricular es obligatorio",
    })
    .min(3, "El código debe tener mínimo 3 caracteres") // Corregido: mínimo 5
    .max(7, "El código debe tener máximo 5 caracteres") // Corregido: máximo 5
    .regex(/^[A-Z0-9-]{3,7}$/, "Formato inválido. Use AAA-AAA o AAA-913")
    .trim()
    .toUpperCase(),
});

export default unidadcurricularSchema;
