import z from 'zod'

const UserSchema = z.object({
    cedula: z.number({invalid_type_error:'Cedula tiene que ser un numero'}).int({invalid_type_error:'Cedula tiene que ser un numero'}).positive({message:'Cedula tiene que ser un numero positivo'}).min(500000, {message:'Cedula tiene que ser un numero de 6 digitos'}),
    nombres: z.string({invalid_type_error:'Nombres tiene que ser un string'}).min(3, {message:'Nombres tiene que tener al menos 3 caracteres'}).max(150, {message:'Nombres tiene que tener menos de 150 caracteres'}).nonempty({message:'Nombres no puede estar vacio'}),
    apellidos: z.string({invalid_type_error:'Apellidos tiene que ser un string'}).min(3, {message:'Apellidos tiene que tener al menos 3 caracteres'}).max(150, {message:'Apellidos tiene que tener menos de 150 caracteres'}).nonempty({message:'Apellidos no puede estar vacio'}),
    email: z.string({invalid_type_error:'Email tiene que ser un string'}).email({message:'Email no es valido'}).max(150, {message:'Email tiene que tener menos de 150 caracteres'}).nonempty({message:'Email no puede estar vacio'}),
    password: z.string({invalid_type_error:'Password tiene que ser un string'}).min(8, {message:'Password tiene que tener al menos 8 caracteres'}).max(40, {message:'Password tiene que tener menos de 40 caracteres'}).nonempty({message:'Password no puede estar vacio'}),
    direccion: z.string({invalid_type_error:'Direccion tiene que ser un string'}).min(3, {message:'Direccion tiene que tener al menos 3 caracteres'}).max(150, {message:'Direccion tiene que tener menos de 150 caracteres'}).nonempty({message:'Direccion no puede estar vacio'}),
    telefono_movil: z.string({invalid_type_error:'Telefono movil tiene que ser un string'}).regex(/^\d{11}$/, {message:'Telefono movil tiene que tener 11 digitos'}),
    telefono_local: z.string({invalid_type_error:'Telefono local tiene que ser un string'}).regex(/^\d{11}$/, {message:'Telefono local tiene que tener 11 digitos'}),
    fecha_nacimiento: z.string({invalid_type_error:'Fecha de nacimiento tiene que ser un string'}).regex(/^\d{2}-\d{2}-\d{4}$/, {message:'Fecha de nacimiento tiene que tener el formato DD-MM-YYYY'}).nonempty({message:'Fecha de nacimiento no puede estar vacio'}),
    genero: z.enum(['masculino', 'femenino'], {error_map: () => ({message:'Genero tiene que ser masculino o femenino'})}),
})

export const validationUser = ({input}) => {
    const validationResult = UserSchema.safeParse(input)
    return validationResult;
}

export const validationPartialUser = ({input}) => {
    const PartialUserSchema = UserSchema.partial().safeParse(input)
    return PartialUserSchema;
}