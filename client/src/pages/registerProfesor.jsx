import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomLabel from '../components/customLabel';
import CustomButton from '../components/customButton';
import ResponsiveAppBar from "../components/navbar";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // para español

// Configura el locale y formato por defecto
dayjs.locale('es');
import Swal from 'sweetalert2';
import axios from 'axios';

export default function FormRegister() {
    const handleProfessorSubmit = async () => {
    try {
    // Formatear fechas antes de enviar
    const formattedData = {
      ...formData,
      cedula: parseInt(formData.cedula, 10),
      fecha_nacimiento: formData.fecha_nacimiento 
        ? dayjs(formData.fecha_nacimiento).format('DD-MM-YYYY') 
        : null,
      fecha_ingreso: formData.fecha_ingreso 
        ? dayjs(formData.fecha_ingreso).format('DD-MM-YYYY') 
        : null
    };

    // Llamada a la API con datos formateados
    const { response } = await axios.post('http://localhost:3000/Profesor/register', formattedData);


    await Swal.fire({
      title: '¡Registro exitoso!',
      text: 'El profesor ha sido registrado correctamente en el sistema.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#1976d2',
    });

    navigate('/profesores');
  } catch (error) {

    Swal.fire({
      title: 'Error',
      text: error.response.data.message || 'No se pudo registrar el profesor. Por favor, inténtalo de nuevo o más tarde.',
      icon: 'error',
      confirmButtonColor: '#1976d2',
    });
  }
};

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
    const [errors, setErrors] = useState({});


    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        cedula: '',
        password: '12345678',
        direccion: '',
        telefono_movil: '',
        telefono_local: '',
        genero: '',
        fecha_nacimiento: null,
        fecha_ingreso: null,
        dedicacion: '',
        categoria: '',
        area_de_conocimiento: '',
        pre_grado: '',
        pos_grado: '',
        ubicacion: '',
    });

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.nombres.trim()) newErrors.nombres = 'Nombres es requerido';
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres)) newErrors.nombres = 'Solo se permiten letras y espacios';

            if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos es requerido';
            else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) newErrors.apellidos = 'Solo se permiten letras y espacios';

            if (!formData.email.trim()) newErrors.email = 'Email es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email no válido';

            if (!formData.cedula.trim()) newErrors.cedula = 'Cédula es requerida';
            else if (!/^\d+$/.test(formData.cedula)) newErrors.cedula = 'Solo se permiten números';
            else if (formData.cedula.length < 6 || formData.cedula.length > 10) newErrors.cedula = 'Cédula debe tener entre 6 y 10 dígitos';

            if (!formData.telefono_movil.trim()) newErrors.telefono_movil = 'Teléfono móvil es requerido';
            else if (!/^\d{10,15}$/.test(formData.telefono_movil)) newErrors.telefono_movil = 'Teléfono no válido';

            if (formData.telefono_local.trim() && !/^\d{7,15}$/.test(formData.telefono_local)) {
                newErrors.telefono_local = 'Teléfono no válido';
            }

            if (!formData.genero) newErrors.genero = 'Género es requerido';
            if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
        }

        if (step === 2) {
            if (!formData.area_de_conocimiento.trim()) newErrors.area_de_conocimiento = 'Área de conocimiento es requerida';
            if (!formData.pre_grado.trim()) newErrors.pre_grado = 'Pre-grado es requerido';
        }

        if (step === 3) {
            if (!formData.fecha_ingreso) newErrors.fecha_ingreso = 'Fecha de ingreso es requerida';
            if (!formData.dedicacion) newErrors.dedicacion = 'Dedicación es requerida';
            if (!formData.categoria) newErrors.categoria = 'Categoría es requerida';
            if (!formData.ubicacion) newErrors.ubicacion = 'Ubicación es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error cuando el usuario escribe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({ ...prev, [field]: date }));
        // Limpiar error cuando el usuario selecciona una fecha
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const nextStep = () => {
        if (!validateStep(step)) return;
        console.log("Datos del formulario:", formData);
        setDirection(1);
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(prev => prev - 1);
    };

    const onSubmit = () => {
        if (!validateStep(3)) return;
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

            <Box className="flex flex-col w-full min-h-screen bg-gray-100 p-4" sx={{ mt: 10 }}>
                {/* mt: 8 = 32px (ajusta según la altura de tu AppBar) */}
                <Typography component={'h2'} variant='h2' className='text-start mx-20 pt-8'>
                    Registrar Profesor
                </Typography>

                <Box className="flex justify-center items-center flex-grow p-6">
                    <Box className="relative w-full max-w-5xl h-[650px]">
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

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6'>
                                            <CustomLabel
                                                id="nombres"
                                                name="nombres"
                                                label="Nombres"
                                                type="text"
                                                variant="outlined"
                                                value={formData.nombres}
                                                onChange={handleChange}
                                                error={!!errors.nombres}
                                                helperText={errors.nombres}
                                            />
                                            <CustomLabel
                                                id="apellidos"
                                                name="apellidos"
                                                label="Apellidos"
                                                type="text"
                                                variant="outlined"
                                                value={formData.apellidos}
                                                onChange={handleChange}
                                                error={!!errors.apellidos}
                                                helperText={errors.apellidos}
                                            />
                                            <CustomLabel
                                                id="email"
                                                name="email"
                                                label="Email"
                                                type="email"
                                                variant="outlined"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                            />
                                            <CustomLabel
                                                id="cedula"
                                                name="cedula"
                                                label="Cédula"
                                                type="text"  // Cambiado de "number" a "text"
                                                variant="outlined"
                                                value={formData.cedula}
                                                onChange={handleChange}
                                                error={!!errors.cedula}
                                                helperText={errors.cedula}
                                                inputProps={{
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]*'
                                                }}
                                            />
                                            <CustomLabel
                                                id="telefono_movil"
                                                name="telefono_movil"
                                                label="Teléfono Móvil"
                                                type="tel"
                                                variant="outlined"
                                                value={formData.telefono_movil}
                                                onChange={handleChange}
                                                error={!!errors.telefono_movil}
                                                helperText={errors.telefono_movil}
                                            />
                                            <CustomLabel
                                                id="telefono_local"
                                                name="telefono_local"
                                                label="Teléfono Local"
                                                type="tel"
                                                variant="outlined"
                                                value={formData.telefono_local}
                                                onChange={handleChange}
                                                error={!!errors.telefono_local}
                                                helperText={errors.telefono_local}
                                            />
                                            <CustomLabel
                                                id="direccion"
                                                name="direccion"
                                                label="Direccion"
                                                type="text"
                                                variant="outlined"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                                error={!!errors.direccion}
                                                helperText={errors.direccion}
                                            />
                                            {/* Campo Género corregido */}
                                            <TextField
                                                id="outlined-select-currency"
                                                select
                                                value={formData.genero}
                                                onChange={handleChange}
                                                label="Genero"
                                                name='genero'
                                            >
                                                <MenuItem value={'masculino'}>
                                                    {'Masculino'}
                                                </MenuItem>
                                                <MenuItem value={'femenino'}>
                                                    {'Femenino'}
                                                </MenuItem>
                                            </TextField>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Fecha de Nacimiento"
                                                    value={formData.fecha_nacimiento}
                                                    onChange={(date) => handleDateChange(date, 'fecha_nacimiento')}
                                                    format="DD/MM/YYYY"  // Asegúrate de que esté en mayúsculas
                                                    slotProps={{
                                                        textField: {
                                                            variant: 'outlined',
                                                            fullWidth: true,
                                                            error: !!errors.fecha_nacimiento,
                                                            helperText: errors.fecha_nacimiento
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Box>
                                    </>
                                )}
                                {/* Paso 2: Información Educativa */}
                                {step === 2 && (
                                    <>
                                        <Typography component={'h3'} variant='h3' className='self-start'>
                                            Información Educativa
                                        </Typography>

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6'>
                                            <CustomLabel
                                                id="area_de_conocimiento"
                                                name="area_de_conocimiento"
                                                label="Área de Conocimiento"
                                                type="text"
                                                variant="outlined"
                                                value={formData.area_de_conocimiento}
                                                onChange={handleChange}
                                                error={!!errors.area_de_conocimiento}
                                                helperText={errors.area_de_conocimiento}
                                            />
                                            <CustomLabel
                                                id="pre_grado"
                                                name="pre_grado"
                                                label="Pre-Grado"
                                                type="text"
                                                variant="outlined"
                                                value={formData.pre_grado}
                                                onChange={handleChange}
                                                error={!!errors.pre_grado}
                                                helperText={errors.pre_grado}
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
                                {/* Paso 3: Información Profesional */}
                                {step === 3 && (
                                    <>
                                        <Typography component={'h3'} variant='h3' className='self-start mb-6 text-xl font-bold'>
                                            Información Profesional
                                        </Typography>

                                        <Box className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-10 py-4'>
                                            {/* Fila 1 */}
                                            <Box className="flex flex-col gap-1">
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label="Fecha de Ingreso *"
                                                        value={formData.fecha_ingreso}
                                                        onChange={(date) => handleDateChange(date, 'fecha_ingreso')}
                                                        format="DD/MM/YYYY"  // Mismo formato aquí
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'outlined',
                                                                fullWidth: true,
                                                                error: !!errors.fecha_ingreso,
                                                                helperText: errors.fecha_ingreso,
                                                                size: 'small',
                                                                sx: {
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '56px',
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </Box>

                                            <Box className="flex flex-col gap-1">
                                                <TextField
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '56px', // Ajusta la altura aquí
                                                        }
                                                    }}
                                                    select
                                                    id="categoria"
                                                    name="categoria"
                                                    label="Categoría *"
                                                    value={formData.categoria}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    error={!!errors.categoria}
                                                    helperText={errors.categoria}
                                                    fullWidth
                                                    size="small"
                                                >
                                                    <MenuItem value="Instructor">Instructor</MenuItem>
                                                    <MenuItem value="Asistente">Asistente</MenuItem>
                                                    <MenuItem value="Agregado">Agregado</MenuItem>
                                                    <MenuItem value="Asociado">Asociado</MenuItem>
                                                    <MenuItem value="Titular">Titular</MenuItem>
                                                </TextField>
                                            </Box>

                                            {/* Fila 2 */}
                                            <Box className="flex flex-col gap-1">
                                                <TextField
                                                    select
                                                    id="dedicacion"
                                                    name="dedicacion"
                                                    label="Dedicación *"
                                                    value={formData.dedicacion}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    error={!!errors.dedicacion}
                                                    helperText={errors.dedicacion}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '56px', // Ajusta la altura aquí
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="Convencional">Convencional</MenuItem>
                                                    <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
                                                    <MenuItem value="Tiempo Completo">Tiempo Completo</MenuItem>
                                                    <MenuItem value="Exclusivo">Exclusiva</MenuItem>
                                                </TextField>
                                            </Box>

                                            <Box className="flex flex-col gap-1">
                                                <TextField
                                                    select
                                                    id="ubicacion"
                                                    name="ubicacion"
                                                    label="Ubicación *"
                                                    value={formData.ubicacion}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    error={!!errors.ubicacion}
                                                    helperText={errors.ubicacion}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '56px',
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="Núcleo de Tegnología y Ciencias Administrativas">
                                                        Núcleo de Tecnología y Ciencias Administrativas
                                                    </MenuItem>
                                                    <MenuItem value="Núcleo de Salud y Deporte">
                                                        Núcleo Salud y Deportes
                                                    </MenuItem>
                                                    <MenuItem value="Núcleo de Humanidades y Ciencias Sociales">
                                                        Núcleo Humanidades y Ciencias Sociales
                                                    </MenuItem>
                                                </TextField>
                                            </Box>
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
                                                        area_de_conocimiento: '',
                                                        pre_grado: '',
                                                        pos_grado: '',
                                                        ubicacion: '',
                                                        disponibilidad: '',
                                                        carga_academica: ''
                                                    });
                                                    setErrors({});
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
                                                onClick={handleProfessorSubmit}
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