import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomLabel from '../components/customLabel';
import CustomSelect from '../components/customSelect';
import CustomButton from '../components/customButton';
import ResponsiveAppBar from "../components/navbar";

export default function FormRegister() {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        cedula: '',
        telefono_movil: '',
        telefono_local: '',
        genero: '',
        fecha_nacimiento: null,
        fecha_ingreso: null,
        dedicacion: '',
        categoria: '',
        area_conocimiento: '',
        pre_grado: '',
        pos_grado: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const nextStep = () => {
        console.log("Datos del formulario:", formData);
        setDirection(1);
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(prev => prev - 1);
    };

    const onSubmit = () => {
        console.log("Formulario enviado:", formData);
        // Aquí iría la lógica para enviar los datos al backend
    };

    // Configuración de animaciones
    const stepVariants = {
        enter: (direction) => ({
            opacity: 0,
            x: direction > 0 ? 50 : -50,
            position: 'absolute'
        }),
        center: {
            opacity: 1,
            x: 0,
            position: 'relative'
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? -50 : 50,
            position: 'absolute'
        })
    };

    const transition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5
    };

    return (
        <>
            <ResponsiveAppBar
                pages={["Universidad", "Académico", "Servicios", "Trámites"]}
                backgroundColor
            />
            
            <Box className="flex flex-col w-full min-h-screen bg-gray-100">
                <Typography component={'h2'} variant='h2' className='text-start mx-20 pt-8'>
                    Registrar Profesor
                </Typography>

                <Box className="flex justify-center items-center flex-grow p-4">
                    <Box className="relative w-full max-w-4xl h-[500px]">
                        <AnimatePresence custom={direction} initial={false}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className="bg-white w-full h-full flex flex-col items-center justify-center gap-5 px-8 py-6 rounded-lg shadow-lg"
                            >
                                {/* Paso 1: Datos Personales */}
                                {step === 1 && (
                                    <>
                                        <Typography component={'h3'} variant='h3' className='self-start'>
                                            Datos Personales
                                        </Typography>

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                                            <CustomLabel
                                                id="nombres"
                                                name="nombres"
                                                label="Nombres"
                                                type="text"
                                                variant="outlined"
                                                value={formData.nombres}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="apellidos"
                                                name="apellidos"
                                                label="Apellidos"
                                                type="text"
                                                variant="outlined"
                                                value={formData.apellidos}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="email"
                                                name="email"
                                                label="Email"
                                                type="email"
                                                variant="outlined"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="cedula"
                                                name="cedula"
                                                label="Cédula"
                                                type="number"
                                                variant="outlined"
                                                value={formData.cedula}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="telefono_movil"
                                                name="telefono_movil"
                                                label="Teléfono Móvil"
                                                type="tel"
                                                variant="outlined"
                                                value={formData.telefono_movil}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="telefono_local"
                                                name="telefono_local"
                                                label="Teléfono Local"
                                                type="tel"
                                                variant="outlined"
                                                value={formData.telefono_local}
                                                onChange={handleChange}
                                            />
                                            <CustomSelect
                                                datos={[
                                                    { value: 'masculino', label: 'Masculino' },
                                                    { value: 'femenino', label: 'Femenino' }
                                                ]}
                                                label='Género'
                                                name="genero"
                                                value={formData.genero}
                                                onChange={handleChange}
                                            />
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Fecha de Nacimiento"
                                                    value={formData.fecha_nacimiento}
                                                    onChange={(date) => handleDateChange(date, 'fecha_nacimiento')}
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
                                    </>
                                )}

                                {/* Paso 2: Información Profesional */}
                                {step === 2 && (
                                    <>
                                        <Typography component={'h3'} variant='h3' className='self-start'>
                                            Información Profesional
                                        </Typography>

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Fecha de Ingreso"
                                                    value={formData.fecha_ingreso}
                                                    onChange={(date) => handleDateChange(date, 'fecha_ingreso')}
                                                    format="DD/MM/YYYY"
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'outlined',
                                                            fullWidth: true
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                            <CustomSelect
                                                datos={[
                                                    { value: 'convencional', label: 'Convencional' },
                                                    { value: 'medio tiempo', label: 'Medio Tiempo' },
                                                    { value: 'tiempo completo', label: 'Tiempo Completo' },
                                                    { value: 'exclusiva', label: 'Exclusiva' }
                                                ]}
                                                label='Dedicación'
                                                name="dedicacion"
                                                value={formData.dedicacion}
                                                onChange={handleChange}
                                            />
                                            <CustomSelect
                                                datos={[
                                                    { value: 'Instructor', label: 'Instructor' },
                                                    { value: 'Asistente', label: 'Asistente' },
                                                    { value: 'Agregado', label: 'Agregado' },
                                                    { value: 'Asociado', label: 'Asociado' },
                                                    { value: 'Titular', label: 'Titular' }
                                                ]}
                                                label='Categoría'
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleChange}
                                            />
                                        </Box>
                                    </>
                                )}

                                {/* Paso 3: Información Educativa */}
                                {step === 3 && (
                                    <>
                                        <Typography component={'h3'} variant='h3' className='self-start'>
                                            Información Educativa
                                        </Typography>

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                                            <CustomLabel
                                                id="area_conocimiento"
                                                name="area_conocimiento"
                                                label="Área de Conocimiento"
                                                type="text"
                                                variant="outlined"
                                                value={formData.area_conocimiento}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="pre_grado"
                                                name="pre_grado"
                                                label="Pre-Grado"
                                                type="text"
                                                variant="outlined"
                                                value={formData.pre_grado}
                                                onChange={handleChange}
                                            />
                                            <CustomLabel
                                                id="pos_grado"
                                                name="pos_grado"
                                                label="Pos-Grado"
                                                type="text"
                                                variant="outlined"
                                                value={formData.pos_grado}
                                                onChange={handleChange}
                                            />
                                        </Box>
                                    </>
                                )}

                                {/* Botones de navegación */}
                                <Box className='flex justify-between w-full mt-6'>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {step === 1 ? (
                                            <CustomButton
                                                type="button"
                                                variant="contained"
                                                className="h-12 w-32 rounded-xl font-medium"
                                                tipo="secondary"
                                                onClick={() => {
                                                    setFormData({
                                                        nombres: '',
                                                        apellidos: '',
                                                        email: '',
                                                        cedula: '',
                                                        telefono_movil: '',
                                                        telefono_local: '',
                                                        genero: '',
                                                        fecha_nacimiento: null,
                                                        fecha_ingreso: null,
                                                        dedicacion: '',
                                                        categoria: '',
                                                        area_conocimiento: '',
                                                        pre_grado: '',
                                                        pos_grado: ''
                                                    });
                                                }}
                                            >
                                                Cancelar
                                            </CustomButton>
                                        ) : (
                                            <CustomButton
                                                type="button"
                                                variant="contained"
                                                className="h-12 w-32 rounded-xl font-medium"
                                                tipo="secondary"
                                                onClick={prevStep}
                                            >
                                                Anterior
                                            </CustomButton>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {step < 3 ? (
                                            <CustomButton
                                                type="button"
                                                variant="contained"
                                                className="h-12 w-32 rounded-xl font-medium"
                                                tipo="primary"
                                                onClick={nextStep}
                                            >
                                                Siguiente
                                            </CustomButton>
                                        ) : (
                                            <CustomButton
                                                type="submit"
                                                variant="contained"
                                                className="h-12 w-32 rounded-xl font-medium"
                                                tipo="primary"
                                                onClick={onSubmit}
                                            >
                                                Registrar
                                            </CustomButton>
                                        )}
                                    </motion.div>
                                </Box>
                            </motion.div>
                        </AnimatePresence>
                    </Box>
                </Box>
            </Box>
        </>
    );
}