import z from 'zod'

const ProfesorSchema = z.object({
    id: z.number({invalid_type_error:'Cedula tiene que ser un numero'}).int({invalid_type_error:'Cedula tiene que ser un numero'}).positive({message:'Cedula tiene que ser un numero positivo'}).min(500000, {message:'Cedula tiene que ser un numero de 6 digitos'}),
    fecha_ingreso: z.string({invalid_type_error:'Fecha de ingreso tiene que ser un string'}).regex(/^\d{4}-\d{2}-\d{2}$/, {message:'Fecha de ingreso tiene que tener el formato DD-MM-YYYY'}).nonempty({message:'Fecha de ingreso no puede estar vacio'}),
    dedicacion: z.enum(['tiempo completo', 'tiempo parcial'], {error_map: () => ({message:'Dedicacion tiene que ser tiempo completo o tiempo parcial'})}),
    categotia: z.enum(['profesor', 'asistente', 'asociado'], {error_map: () => ({message:'Categoria tiene que ser profesor, asistente o asociado'})}),
    area_de_conocimiento: z.string({invalid_type_error:'Area de conocimiento tiene que ser un string'}).min(3, {message:'Area de conocimiento tiene que tener al menos 3 caracteres'}).max(150, {message:'Area de conocimiento tiene que tener menos de 150 caracteres'}).nonempty({message:'Area de conocimiento no puede estar vacio'}),
    pre_grado: z.string({invalid_type_error:'Pre grado tiene que ser un string'}).min(3, {message:'Pre grado tiene que tener al menos 3 caracteres'}).max(150, {message:'Pre grado tiene que tener menos de 150 caracteres'}).nonempty({message:'Pre grado no puede estar vacio'}),
    post_grado: z.string({invalid_type_error:'Post grado tiene que ser un string'}).min(3, {message:'Post grado tiene que tener al menos 3 caracteres'}).max(150, {message:'Post grado tiene que tener menos de 150 caracteres'}).nonempty({message:'Post grado no puede estar vacio'}),
})

export const validationProfesor = ({input}) => {
    const validationResult = ProfesorSchema.safeParse(input)
    return validationResult;
}

export const validationPartialProfesor = ({input}) => {
    const PartialProfesorSchema = ProfesorSchema.partial().safeParse(input)
    return PartialProfesorSchema;
}