import z from "zod";

const unidadcurricularSchema = z.object({
  id_trayecto: z
    .number({
      invalid_type_error: "unidades_curriculares:validation.id_trayecto_invalid_type|El id de trayecto tiene que se un numero",
      required_error: "unidades_curriculares:validation.id_trayecto_required|El id de trayecto es obligatorio",
    })
    .positive("unidades_curriculares:validation.id_trayecto_positive|El id tiene que se positivo")
    .optional(),

  nombre_unidad_curricular: z
    .string({
      invalid_type_error: "unidades_curriculares:validation.nombre_unidad_curricular_invalid_type|El nombre del Unidad Curricular debe ser un texto",
      required_error: "unidades_curriculares:validation.nombre_unidad_curricular_required|El nombre del Unidad Curricular es obligatorio",
    })
    .min(5, "unidades_curriculares:validation.nombre_unidad_curricular_min_length|El nombre debe tener al menos 5 caracteres")
    .max(40, "unidades_curriculares:validation.nombre_unidad_curricular_max_length|El nombre no puede exceder los 40 caracteres")
    .regex(
      /^[A-Za-zÁ-ÿ0-9\s\-]+$/,
      "unidades_curriculares:validation.nombre_unidad_curricular_invalid_format|Solo se permiten letras, números, espacios y guiones"
    ),

  descripcion_unidad_curricular: z
    .string({
      invalid_type_error: "unidades_curriculares:validation.descripcion_unidad_curricular_invalid_type|La descripción debe ser un texto",
      required_error: "unidades_curriculares:validation.descripcion_unidad_curricular_required|La descripción es obligatoria",
    })
    .min(20, "unidades_curriculares:validation.descripcion_unidad_curricular_min_length|La descripción debe tener al menos 20 caracteres")
    .max(200, "unidades_curriculares:validation.descripcion_unidad_curricular_max_length|La descripción no puede exceder los 200 caracteres"),

  carga_horas_academicas: z
    .number({
      invalid_type_error: "unidades_curriculares:validation.carga_horas_academicas_invalid_type|La carga de horas de la unidad curricular debe ser un numero",
      required_error: "unidades_curriculares:validation.carga_horas_academicas_required|La carga de horas de la unidad curricular es obligatoria",
    })
    .min(2, "unidades_curriculares:validation.carga_horas_academicas_min|Lo minimo son 2 horas de 45min.")
    .max(4, "unidades_curriculares:validation.carga_horas_academicas_max|Lo maximo son 5 horas de 45min.")
    .positive("unidades_curriculares:validation.carga_horas_academicas_positive|La carga de horas de la unidad curricular debe ser un número positivo"),

  codigo_unidad_curricular: z
    .string({
      invalid_type_error: "unidades_curriculares:validation.codigo_unidad_curricular_invalid_type|El código debe ser un texto",
      required_error: "unidades_curriculares:validation.codigo_unidad_curricular_required|El código del Unidad Curricular es obligatorio",
    })
    .min(3, "unidades_curriculares:validation.codigo_unidad_curricular_min_length|El código debe tener mínimo 3 caracteres")
    .max(7, "unidades_curriculares:validation.codigo_unidad_curricular_max_length|El código debe tener máximo 7 caracteres")
    .regex(/^[A-Z0-9-]{3,7}$/, "unidades_curriculares:validation.codigo_unidad_curricular_invalid_format|Formato inválido. Use AAA-AAA o AAA-913")
    .trim()
    .toUpperCase(),
});

export default unidadcurricularSchema;