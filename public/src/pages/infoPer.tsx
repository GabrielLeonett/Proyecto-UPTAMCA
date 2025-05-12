import CustomButton from '../components/customButton';
import Box from '@mui/material/Box';
import * as React from 'react';
import DatePicker from 'react-datepicker';
import Typography from '@mui/material/Typography';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import ResponsiveAppBar from '../components/navbar';
import { CustomSelect } from '../components/customSelect';
import { motion } from 'framer-motion';

registerLocale('es', es);

interface Props {
  onPrev: () => void;
  onNext: () => void;
}

export default function InfoPer({ onPrev, onNext }: Props) {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    return (
        <>
            <ResponsiveAppBar pages={['Universidad', 'Academico', 'Servicios', 'Tramites']} backgroundColor />
            <br />
            <br />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='bg-gray-100 flex flex-col justify-center items-center h-screen w-screen'
            >
                <Box className="w-full">
                    <Typography component={'h2'} variant='h2' className='text-start mx-20'>
                        Registrar Profesor
                    </Typography>
                </Box>
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className='bg-white flex flex-col items-center justify-center gap-5 lg:w-320 px-20 py-10 rounded-lg shadow-lg'
                >
                    <Box className="flex justify-start items-start w-full">
                        <Typography component={'h3'} variant='h3'>Informacion Profesional</Typography>
                    </Box>
                     <Box className="flex flex-col w-full">
                            <Typography component={'label'}>Fecha de Ingreso</Typography>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => setSelectedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                locale="es"
                                className='w-full h-full border border-gray-300 rounded-md p-2'
                            />
                        </Box>
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomSelect
                            datos={[
                                { value: 'convencional', label: 'Convencional' },
                                { value: 'medio tiempo', label: 'Medio Tiempo' },
                                { value: 'tiempo completo', label: 'Tiempo Completo' },
                                { value: 'exclusiva', label: 'Exclusiva' } 
                            ]}
                            label='Dedicacion'
                            placeholder='Dedicacion'
                            className="w-full"
                        />
                    </Box>
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomSelect
                            datos={[
                                { value: 'Instructor', label: 'Instructor' },
                                { value: 'Asistente', label: 'Asistente' },
                                { value: 'Agregado', label: 'Agregado' },
                                { value: 'Asociado', label: 'Asociado' },
                                { value: 'Titular', label: 'Titular' }
                            ]}
                            label='Categoria'
                            placeholder='Categoria'
                            className="w-full"
                        />
                    </Box>
                    <Box component={'div'} className='flex flex-row justify-end items-end gap-10 w-full'>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <CustomButton
                                type="button"
                                variant="contained"
                                className="h-15 w-50 rounded-xl py-3 font-medium"
                                tipo="secondary"
                                onClick={onPrev} // Botón Cancelar ahora navega a vista anterior
                            >
                                Anterior
                            </CustomButton>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <CustomButton
                                type="submit"
                                variant="contained"
                                className="h-15 w-50 rounded-xl py-3 font-medium"
                                tipo="primary"
                                onClick={onNext} // Botón Aceptar ahora navega a siguiente vista
                            >
                                Siguiente
                            </CustomButton>
                        </motion.div>
                    </Box>
                </motion.div>
            </motion.div>
        </>
    );
}