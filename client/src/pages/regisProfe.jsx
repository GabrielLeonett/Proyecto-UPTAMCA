import CustomButton from '../components/customButton';
import Box from '@mui/material/Box';
import * as React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Typography from '@mui/material/Typography';
import ResponsiveAppBar from '../components/navbar';
import CustomLabel from '../components/customLabel';
import CustomSelect  from '../components/customSelect';
import { motion } from 'framer-motion';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export default function RegisProfe({ onNext }) {
    const [formData, setFormData] = React.useState({
        nombres: '',
        apellidos: '',
        email: '',
        cedula: '',
        telefono_movil: '',
        telefono_local: '',
        genero: '',
        fecha_nacimiento: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            fecha_nacimiento: date
        }));
    };

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
                        <Typography component={'h3'} variant='h3'>Datos Personales</Typography>
                    </Box>

                    {/* Campos de Nombres y Apellidos */}
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomLabel
                            id="Nombres"
                            name="nombres"
                            label="Nombres"
                            type="text"
                            variant="outlined"
                            className="w-full"
                            value={formData.nombres}
                            onChange={handleChange}
                        />
                        <CustomLabel
                            id="Apellidos"
                            name="apellidos"
                            label="Apellidos"
                            type="text"
                            variant="outlined"
                            className="w-full"
                            value={formData.apellidos}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Campos de Email y Cédula */}
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomLabel
                            id="Email"
                            name="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            className="w-full"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <CustomLabel
                            id="Cedula"
                            name="cedula"
                            label="Cédula"
                            type="number"
                            variant="outlined"
                            className="w-full"
                            value={formData.cedula}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Campos de Teléfonos */}
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomLabel
                            id="Telefono_movil"
                            name="telefono_movil"
                            label="Teléfono Móvil"
                            type="tel"
                            variant="outlined"
                            className="w-full"
                            value={formData.telefono_movil}
                            onChange={handleChange}
                        />
                        <CustomLabel
                            id="Telefono_local"
                            name="telefono_local"
                            label="Teléfono Local"
                            type="tel"
                            variant="outlined"
                            className="w-full"
                            value={formData.telefono_local}
                            onChange={handleChange}
                        />
                    </Box>

                    {/* Selector de Género y Fecha */}
                    <Box component={'div'} className='flex flex-row gap-10 w-full'>
                        <CustomSelect
                            datos={[
                                { value: 'masculino', label: 'Masculino' },
                                { value: 'femenino', label: 'Femenino' }
                            ]}
                            label='Seleccione Género'
                            placeholder='Seleccione Género'
                            className="w-full"
                            name="genero"
                            value={formData.genero}
                            onChange={handleChange}
                        />
                        <Box className="flex flex-col w-full">
                            <Typography component={'label'}>Fecha de Nacimiento</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    label="Fecha de Nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleDateChange}
                                    format="DD/MM/YYYY"
                                    slotProps={{
                                        textField: {
                                            variant: 'outlined',
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>
                    </Box>

                    {/* Botones */}
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
                                onClick={() => {
                                    // Lógica opcional para resetear
                                    console.log("Formulario cancelado");
                                    setFormData({
                                        nombres: '',
                                        apellidos: '',
                                        email: '',
                                        cedula: '',
                                        telefono_movil: '',
                                        telefono_local: '',
                                        genero: '',
                                        fecha_nacimiento: null
                                    });
                                }}
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
                                onClick={() => {
                                    console.log("Datos del formulario:", formData);
                                    onNext();
                                }}
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