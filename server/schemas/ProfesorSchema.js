import z from 'zod'

const ProfesorSchema = z.object({
    id: z.number({invalid_type_error:'Cedula tiene que ser un numero'}).int({invalid_type_error:'Cedula tiene que ser un numero'}).positive({message:'Cedula tiene que ser un numero positivo'}).min(500000, {message:'Cedula tiene que ser un numero de 6 digitos'}),
    nombres: z.string({invalid_type_error:'Nombre tiene que ser un string'}).min(3, {message:'Nombre tiene que tener al menos 3 caracteres'}).max(150, {message:'Nombre tiene que tener menos de 150 caracteres'}).nonempty({message:'Nombre no puede estar vacio'}),
    email: z.string({invalid_type_error:'Email tiene que ser un string'}).email({message:'Email no es valido'}).max(150, {message:'Email tiene que tener menos de 150 caracteres'}).nonempty({message:'Email no puede estar vacio'}),
    password: z.string({invalid_type_error:'Password tiene que ser un string'}).min(8, {message:'Password tiene que tener al menos 8 caracteres'}).max(40, {message:'Password tiene que tener menos de 40 caracteres'}).nonempty({message:'Password no puede estar vacio'}),
    direccion: z.string({invalid_type_error:'Direccion tiene que ser un string'}).min(3, {message:'Direccion tiene que tener al menos 3 caracteres'}).max(150, {message:'Direccion tiene que tener menos de 150 caracteres'}).nonempty({message:'Direccion no puede estar vacio'}),
    telefono_movil: z.string({invalid_type_error:'Telefono movil tiene que ser un string'}).regex(/^\d{11}$/, {message:'Telefono movil tiene que tener 11 digitos'}),
    telefono_local: z.string({invalid_type_error:'Telefono local tiene que ser un string'}).regex(/^\d{11}$/, {message:'Telefono local tiene que tener 11 digitos'}),
    fecha_nacimiento: z.string({invalid_type_error:'Fecha de nacimiento tiene que ser un string'}).regex(/^\d{4}-\d{2}-\d{2}$/, {message:'Fecha de nacimiento tiene que tener el formato DD-MM-YYYY'}).nonempty({message:'Fecha de nacimiento no puede estar vacio'}),
    genero: z.enum(['masculino', 'femenino'], {error_map: () => ({message:'Genero tiene que ser masculino o femenino'})}),
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