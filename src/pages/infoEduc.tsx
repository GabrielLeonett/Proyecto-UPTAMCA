import { Head } from '@inertiajs/react';
import CustomButton from '../components/customButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import ResponsiveAppBar from '../components/navbar';
import CustomLabel from '../components/customLabel';
import { motion } from 'framer-motion'; // Corregido: importar desde 'framer-motion'

registerLocale('es', es);

export default function RegisProfe() {

    return (
        <>
            <Head title='Registro de Profesores' />
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
                        <Typography component={'h3'} variant='h3'>Informacion Educativa</Typography>
                    </Box>
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomLabel
                            id="Area de Conocimiento"
                            name="Area de Conocimiento"
                            label="Area de Conocimiento"
                            type="string"
                            variant="outlined"
                            className="w-full"
                        >
                            Nombre
                        </CustomLabel>
                    </Box>
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomLabel
                            id="Pre-Grado"
                            name="Pre-Grado"
                            label="Pre-Grado"
                            type="string"
                            variant="outlined"
                            className="w-full"
                        >
                            Teléfono
                        </CustomLabel>
                        <CustomLabel
                            id="Pos-Grado"
                            name="Pos-Grado"
                            label="Pos-Grado"
                            type="string"
                            variant="outlined"
                            className="w-full"
                        >
                            Teléfono
                        </CustomLabel>
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
                            >
                                Cancelar
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
                                onClick={()=>{
                                        
                                }}
                                >
                                    
                                
                                Aceptar
                            </CustomButton>
                        </motion.div>
                    </Box>
                </motion.div>
            </motion.div>
        </>
    );
}

