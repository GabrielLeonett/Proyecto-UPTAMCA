import z from 'zod';

const HorarioSchema = z.object({
  profesor: z.string({ invalid_type_error: 'Profesor debe ser un texto' })
    .min(3, { message: 'El nombre del profesor debe tener al menos 3 caracteres' })
    .nonempty({ message: 'El campo Profesor no puede estar vacío' }),

  trayecto: z.enum(['I', 'II', 'III', 'IV'], {
    errorMap: () => ({ message: 'Trayecto inválido' }),
  }),

  seccion: z.enum(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'], {
    errorMap: () => ({ message: 'Sección inválida' }),
  }),

  pnf: z.enum([
    'Informática',
    'Administración',
    'Prevención',
    'Fisioterapia',
    'Terapia Ocupacional',
    'Deporte',
    'Enfermería',
    'Psicología',
  ], {
    errorMap: () => ({ message: 'PNF inválido' }),
  }),

  materia: z.string({ invalid_type_error: 'Materia debe ser un texto' })
    .min(3, { message: 'La materia debe tener al menos 3 caracteres' })
    .nonempty({ message: 'El campo Materia no puede estar vacío' }),

  dia: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], {
    errorMap: () => ({ message: 'Día inválido' }),
  }),

  hora: z.string({ invalid_type_error: 'Hora debe ser un string con formato HH:MM' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'La hora debe tener el formato HH:MM (24h)',
    }),
});

export const validationHorario = ({ input }) => {
  const validationResult = HorarioSchema.safeParse(input);
  return validationResult;
};

export const validationPartialHorario = ({ input }) => {
  const PartialHorarioSchema = HorarioSchema.partial().safeParse(input);
  return PartialHorarioSchema;
};
