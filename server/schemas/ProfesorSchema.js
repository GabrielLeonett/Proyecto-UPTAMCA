import z from 'zod'

const ProfesorSchema = z.object({
    cedula: z.number({invalid_type_error:'Cedula tiene que ser un numero'}).int({invalid_type_error:'Cedula tiene que ser un numero'}).positive({message:'Cedula tiene que ser un numero positivo'}).min(500000, {message:'Cedula tiene que ser un numero de 6 digitos'}),
    fecha_ingreso: z.string({invalid_type_error:'Fecha de ingreso tiene que ser un string'}).regex(/^\d{2}-\d{2}-\d{4}$/, {message:'Fecha de ingreso tiene que tener el formato DD-MM-YYYY'}).nonempty({message:'Fecha de ingreso no puede estar vacio'}),
    dedicacion: z.enum(['Convencional','Tiempo Completo', 'Medio Tiempo', 'Exclusivo'], {error_map: () => ({message:'La Dedicacion tiene que ser Convencional, Tiempo Completo, Medio Tiempo o Exclusivo'})}),
    ubicacion: z.enum(['Núcleo de Salud y Deporte','Núcleo de Tegnología y Ciencias Administrativas', 'Núcleo de Humanidades y Ciencias Sociales'], {error_map: () => ({message:'La ubicacion tiene que ser Núcleo de Salud y Deporte, Núcleo de Tegnología y Ciencias Administrativas o Núcleo de Humanidades y Ciencias Sociales'})}),
    categoria: z.enum(['Instructor', 'Asistente', 'Asociado', 'Agregado', 'Titular'], {error_map: () => ({message:'La Categoria tiene que ser Instructor, Asistente, Asociado, Agregado o Titular'})}),
    area_de_conocimiento: z.string({invalid_type_error:'Area de conocimiento tiene que ser un string'}).min(3, {message:'Area de conocimiento tiene que tener al menos 3 caracteres'}).max(150, {message:'Area de conocimiento tiene que tener menos de 150 caracteres'}).nonempty({message:'Area de conocimiento no puede estar vacio'}),
    pre_grado: z.string({invalid_type_error:'Pre grado tiene que ser un string'}).min(3, {message:'Pre grado tiene que tener al menos 3 caracteres'}).max(150, {message:'Pre grado tiene que tener menos de 150 caracteres'}).nonempty({message:'Pre grado no puede estar vacio'}),
    pos_grado: z.string({invalid_type_error:'Post grado tiene que ser un string'}).min(3, {message:'Post grado tiene que tener al menos 3 caracteres'}).max(150, {message:'Post grado tiene que tener menos de 150 caracteres'}).nonempty({message:'Post grado no puede estar vacio'}),
})

export const validationProfesor = ({input}) => {
    const validationResult = ProfesorSchema.safeParse(input)
    return validationResult;
}

export const validationPartialProfesor = ({input}) => {
    const PartialProfesorSchema = ProfesorSchema.partial().safeParse(input)
    return PartialProfesorSchema;
}