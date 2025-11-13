import z from "zod";

const userSchema = z.object({
  cedula: z
    .number({
      required_error: "usuarios:validation.cedula_required|La cedula es requerida",
      invalid_type_error: "usuarios:validation.cedula_invalid_type|La cedula debe ser un numero",
    })
    .int("usuarios:validation.cedula_integer|La cédula debe ser un número entero")
    .positive("usuarios:validation.cedula_positive|La cédula debe ser un número positivo")
    .min(1000000, "usuarios:validation.cedula_min|La cédula debe tener al menos 7 dígitos")
    .max(99999999, "usuarios:validation.cedula_max|La cédula no puede tener más de 8 dígitos"),

  municipio: z.enum(["Carrizal", "Los Salias", "Guaicaipuro"], {
    required_error: "usuarios:validation.municipio_required|El municipio es obligatorio",
    invalid_type_error: "usuarios:validation.municipio_invalid_enum|El municipio debe ser: Carrizal, Los Salias o Guaicaipuro",
  }),

  nombres: z
    .string({ 
      invalid_type_error: "usuarios:validation.nombres_invalid_type|Nombres tiene que ser un string",
      required_error: "usuarios:validation.nombres_required|Los nombres son obligatorios"
    })
    .min(3, { message: "usuarios:validation.nombres_min_length|Nombres tiene que tener al menos 3 caracteres" })
    .max(150, { message: "usuarios:validation.nombres_max_length|Nombres tiene que tener menos de 150 caracteres" })
    .nonempty({ message: "usuarios:validation.nombres_empty|Nombres no puede estar vacio" }),

  apellidos: z
    .string({ 
      invalid_type_error: "usuarios:validation.apellidos_invalid_type|Apellidos tiene que ser un string",
      required_error: "usuarios:validation.apellidos_required|Los apellidos son obligatorios"
    })
    .min(3, { message: "usuarios:validation.apellidos_min_length|Apellidos tiene que tener al menos 3 caracteres" })
    .max(150, { message: "usuarios:validation.apellidos_max_length|Apellidos tiene que tener menos de 150 caracteres" })
    .nonempty({ message: "usuarios:validation.apellidos_empty|Apellidos no puede estar vacio" }),

  email: z
    .string({ 
      invalid_type_error: "usuarios:validation.email_invalid_type|Email tiene que ser un string",
      required_error: "usuarios:validation.email_required|El email es obligatorio"
    })
    .email({ message: "usuarios:validation.email_invalid_format|Email no es valido" })
    .max(150, { message: "usuarios:validation.email_max_length|Email tiene que tener menos de 150 caracteres" })
    .nonempty({ message: "usuarios:validation.email_empty|Email no puede estar vacio" }),

  password: z
    .string({ 
      invalid_type_error: "usuarios:validation.password_invalid_type|Password tiene que ser un string",
      required_error: "usuarios:validation.password_required|La contraseña es obligatoria"
    })
    .min(8, { message: "usuarios:validation.password_min_length|Password tiene que tener al menos 8 caracteres" })
    .max(40, { message: "usuarios:validation.password_max_length|Password tiene que tener menos de 40 caracteres" })
    .optional(),

  direccion: z
    .string({ 
      invalid_type_error: "usuarios:validation.direccion_invalid_type|Direccion tiene que ser un string",
      required_error: "usuarios:validation.direccion_required|La dirección es obligatoria"
    })
    .min(3, { message: "usuarios:validation.direccion_min_length|Direccion tiene que tener al menos 3 caracteres" })
    .max(150, { message: "usuarios:validation.direccion_max_length|Direccion tiene que tener menos de 150 caracteres" })
    .nonempty({ message: "usuarios:validation.direccion_empty|Direccion no puede estar vacio" }),

  telefono_movil: z
    .string({ 
      invalid_type_error: "usuarios:validation.telefono_movil_invalid_type|Telefono movil tiene que ser un string",
      required_error: "usuarios:validation.telefono_movil_required|El teléfono móvil es obligatorio"
    })
    .regex(/^\d{11}$/, {
      message: "usuarios:validation.telefono_movil_invalid_format|Telefono movil tiene que tener 11 digitos",
    }),

  telefono_local: z
    .string({ 
      invalid_type_error: "usuarios:validation.telefono_local_invalid_type|Telefono local tiene que ser un string"
    })
    .regex(/^\d{11}$/, { 
      message: "usuarios:validation.telefono_local_invalid_format|Telefono local tiene que tener 11 digitos" 
    })
    .optional(),

  fecha_nacimiento: z
    .string({
      invalid_type_error: "usuarios:validation.fecha_nacimiento_invalid_type|Fecha de nacimiento tiene que ser un string",
      required_error: "usuarios:validation.fecha_nacimiento_required|La fecha de nacimiento es obligatoria"
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "usuarios:validation.fecha_nacimiento_invalid_format|Fecha de nacimiento tiene que tener el formato DD-MM-YYYY",
    })
    .nonempty({ message: "usuarios:validation.fecha_nacimiento_empty|Fecha de nacimiento no puede estar vacio" }),

  genero: z.enum(["masculino", "femenino"], {
    required_error: "usuarios:validation.genero_required|El género es obligatorio",
    invalid_type_error: "usuarios:validation.genero_invalid_enum|Genero tiene que ser masculino o femenino",
  }),
});

export default userSchema;