import z from "zod";

const seccionSchema = z.object({
    id_trayecto: z
    .number({
      invalid_type_error: "secciones:validation.id_trayecto_invalid_type|El id de trayecto tiene que ser un numero",
      required_error: "secciones:validation.id_trayecto_required|El id de trayecto es obligatorio",
    })
    .positive("secciones:validation.id_trayecto_positive|El id de trayecto tiene que se positivo"),
    
    id_turno: z
    .number({
      invalid_type_error: "secciones:validation.id_turno_invalid_type|El id de turno tiene que ser un numero",
      required_error: "secciones:validation.id_turno_required|El id de turno es obligatorio",
    })
    .positive("secciones:validation.id_turno_positive|El id de turno tiene que se positivo")
    .optional(),

    poblacion_estudiantil: z.number({
      invalid_type_error: "secciones:validation.poblacion_estudiantil_invalid_type|La poblacion estudiantil tiene que ser un numero.",
      required_error: "secciones:validation.poblacion_estudiantil_required|La poblacion estudiantil es obligatoria",
    })
    .min(8, "secciones:validation.poblacion_estudiantil_min|La poblacion tiene que ser mayor a 8")
    .max(400, "secciones:validation.poblacion_estudiantil_max|La poblacion tiene que ser menor a 400")
    .positive("secciones:validation.poblacion_estudiantil_positive|La poblacion tiene que ser positiva"),
});

export default seccionSchema;