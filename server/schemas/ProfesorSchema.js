import z from 'zod';

const ProfesorSchema = z.object({
    cedula: z.number({
        required_error: "La cédula es requerida",
        invalid_type_error: "La cédula debe ser un número"
    })
    .int("La cédula debe ser un número entero")
    .positive("La cédula debe ser un número positivo")
    .min(500000, "La cédula debe tener al menos 6 dígitos"),
    
    fecha_ingreso: z.string({
        required_error: "La fecha de ingreso es requerida",
        invalid_type_error: "La fecha de ingreso debe ser texto"
    })
    .regex(/^\d{2}-\d{2}-\d{4}$/, "La fecha de ingreso debe tener el formato DD-MM-AAAA")
    .nonempty("La fecha de ingreso no puede estar vacía"),
    
    dedicacion: z.enum(
        ['Convencional', 'Tiempo Completo', 'Medio Tiempo', 'Exclusivo'], 
        {
            required_error: "La dedicación es requerida",
            invalid_type_error: "La dedicación debe ser: Convencional, Tiempo Completo, Medio Tiempo o Exclusivo"
        }
    ),
    
    ubicacion: z.enum(
        ['Núcleo de Salud y Deporte', 'Núcleo de Tegnología y Ciencias Administrativas', 'Núcleo de Humanidades y Ciencias Sociales'], 
        {
            required_error: "La ubicación es requerida",
            invalid_type_error: "La ubicación debe ser: Núcleo de Salud y Deporte, Núcleo de Tegnología y Ciencias Administrativas o Núcleo de Humanidades y Ciencias Sociales"
        }
    ),
    
    categoria: z.enum(
        ['Instructor', 'Asistente', 'Asociado', 'Agregado', 'Titular'], 
        {
            required_error: "La categoría es requerida",
            invalid_type_error: "La categoría debe ser: Instructor, Asistente, Asociado, Agregado o Titular"
        }
    ),
    
    area_de_conocimiento: z.string({
        required_error: "El área de conocimiento es requerida",
        invalid_type_error: "El área de conocimiento debe ser texto"
    })
    .min(3, "El área de conocimiento debe tener al menos 3 caracteres")
    .max(150, "El área de conocimiento no puede exceder 150 caracteres")
    .nonempty("El área de conocimiento no puede estar vacía"),
    
    pre_grado: z.string({
        required_error: "El pregrado es requerido",
        invalid_type_error: "El pregrado debe ser texto"
    })
    .min(3, "El pregrado debe tener al menos 3 caracteres")
    .max(150, "El pregrado no puede exceder 150 caracteres")
    .nonempty("El pregrado no puede estar vacío"),
    
    pos_grado: z.string({
        required_error: "El posgrado es requerido",
        invalid_type_error: "El posgrado debe ser texto"
    })
    .min(3, "El posgrado debe tener al menos 3 caracteres")
    .max(150, "El posgrado no puede exceder 150 caracteres")
    .nonempty("El posgrado no puede estar vacío")
});

export const validationProfesor = ({input}) => {
    return ProfesorSchema.safeParse(input);
};

export const validationPartialProfesor = ({input}) => {
    return ProfesorSchema.partial().safeParse(input);
};