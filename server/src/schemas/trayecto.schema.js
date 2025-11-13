import { z } from "zod";

const TrayectoSchema = z.object({
  nombre_trayecto: z
    .string({
      invalid_type_error: "trayectos:validation.nombre_trayecto_invalid_type|El nombre del trayecto debe ser un texto",
      required_error: "trayectos:validation.nombre_trayecto_required|El nombre del trayecto es obligatorio",
    })
    .min(3, "trayectos:validation.nombre_trayecto_min_length|El nombre debe tener al menos 3 caracteres")
    .max(100, "trayectos:validation.nombre_trayecto_max_length|El nombre no puede exceder los 100 caracteres")
    .regex(/^[A-Za-zÁ-ÿ0-9\s\-]+$/, {
      message: "trayectos:validation.nombre_trayecto_invalid_format|El nombre solo puede contener letras, números, espacios y guiones",
    }),

  numero_trayecto: z
    .number({
      invalid_type_error: "trayectos:validation.numero_trayecto_invalid_type|El número del trayecto debe ser un número",
      required_error: "trayectos:validation.numero_trayecto_required|El número del trayecto es obligatorio",
    })
    .int("trayectos:validation.numero_trayecto_integer|El número del trayecto debe ser un número entero")
    .min(1, "trayectos:validation.numero_trayecto_min|El número mínimo del trayecto es 1")
    .max(5, "trayectos:validation.numero_trayecto_max|El número máximo del trayecto es 5")
    .positive("trayectos:validation.numero_trayecto_positive|El número del trayecto debe ser positivo"),

  descripcionTrayecto: z
    .string({
      invalid_type_error: "trayectos:validation.descripcion_trayecto_invalid_type|La descripción debe ser un texto",
      required_error: "trayectos:validation.descripcion_trayecto_required|La descripción es obligatoria",
    })
    .min(20, "trayectos:validation.descripcion_trayecto_min_length|La descripción debe tener al menos 20 caracteres")
    .max(500, "trayectos:validation.descripcion_trayecto_max_length|La descripción no puede exceder los 500 caracteres"),

  duracion_trayecto: z
    .number({
      invalid_type_error: "trayectos:validation.duracion_trayecto_invalid_type|La duración debe ser un número",
      required_error: "trayectos:validation.duracion_trayecto_required|La duración es obligatoria",
    })
    .int("trayectos:validation.duracion_trayecto_integer|La duración debe ser un número entero")
    .min(1, "trayectos:validation.duracion_trayecto_min|La duración mínima es 1 trimestre")
    .max(4, "trayectos:validation.duracion_trayecto_max|La duración máxima es 4 trimestres")
    .positive("trayectos:validation.duracion_trayecto_positive|La duración debe ser positiva"),

  id_pnf: z
    .number({
      invalid_type_error: "trayectos:validation.id_pnf_invalid_type|El ID del PNF debe ser un número",
      required_error: "trayectos:validation.id_pnf_required|El ID del PNF es obligatorio",
    })
    .int("trayectos:validation.id_pnf_integer|El ID del PNF debe ser un número entero")
    .positive("trayectos:validation.id_pnf_positive|El ID del PNF debe ser un número positivo"),

  estado_trayecto: z.enum(["activo", "inactivo", "en_desarrollo"], {
    invalid_type_error: "trayectos:validation.estado_trayecto_invalid_enum|El estado del trayecto debe ser: activo, inactivo o en_desarrollo",
    required_error: "trayectos:validation.estado_trayecto_required|El estado del trayecto es obligatorio",
  }).default("activo")
});

export default TrayectoSchema;