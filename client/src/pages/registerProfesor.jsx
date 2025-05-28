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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function FormRegister() {
  const handleProfessorSubmit = async () => {
  try {
    // Llamada directa a la API
    const { data } = await axios.post('/api/profesores', formData);
    
    // Mensaje de éxito y redirección
    await Swal.fire({
      title: '¡Registro exitoso!',
      text: 'El profesor ha sido registrado correctamente en el sistema.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#1976d2',
    });
    
    navigate('/profesores'); // Redirección automática después del mensaje

  } catch (error) {
    // Manejo específico para profesor duplicado
    if (error.response?.status === 409) {
      await Swal.fire({
        title: 'Profesor ya registrado',
        text: 'Lo siento, este profesor ya está registrado en el sistema.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#d32f2f',
      });
    } else {
      // Otros errores
      await Swal.fire({
        title: 'Error en el registro',
        text: 'Ocurrió un problema al registrar el profesor. Por favor intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
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
        telefono_movil: '',
        telefono_local: '',
        genero: '',
        fecha_nacimiento: null,
        fecha_ingreso: null,
        dedicacion: '',
        categoria: '',
        area_conocimiento: '',
        pre_grado: '',
        pos_grado: '',
        ubicacion: '',
        disponibilidad: '',
        carga_academica: ''
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
            if (!formData.area_conocimiento.trim()) newErrors.area_conocimiento = 'Área de conocimiento es requerida';
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

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        console.log("Valor seleccionado:", name, value);
        // Limpiar error
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
                                                type="number"
                                                variant="outlined"
                                                value={formData.cedula}
                                                onChange={handleChange}
                                                error={!!errors.cedula}
                                                helperText={errors.cedula}
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
                                                <MenuItem value={'Femenino'}>
                                                    {'Femenino'}
                                                </MenuItem>
                                            </TextField>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Fecha de Nacimiento"
                                                    value={formData.fecha_nacimiento}
                                                    onChange={(date) => handleDateChange(date, 'fecha_nacimiento')}
                                                    format="DD/MM/YYYY"
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
                                                id="area_conocimiento"
                                                name="area_conocimiento"
                                                label="Área de Conocimiento"
                                                type="text"
                                                variant="outlined"
                                                value={formData.area_conocimiento}
                                                onChange={handleChange}
                                                error={!!errors.area_conocimiento}
                                                helperText={errors.area_conocimiento}
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
                                                        format="DD/MM/YYYY"
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
                                                    <MenuItem value="convencional">Convencional</MenuItem>
                                                    <MenuItem value="medio tiempo">Medio Tiempo</MenuItem>
                                                    <MenuItem value="tiempo completo">Tiempo Completo</MenuItem>
                                                    <MenuItem value="exclusiva">Exclusiva</MenuItem>
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
                                                    <MenuItem value="Nucleo de Tecnologia y Ciencias Administrativas">
                                                        Núcleo de Tecnología y Ciencias Administrativas
                                                    </MenuItem>
                                                    <MenuItem value="Nucleo Salud y Deportes">
                                                        Núcleo Salud y Deportes
                                                    </MenuItem>
                                                    <MenuItem value="Nucleo Humanidades y Ciencias Sociales">
                                                        Núcleo Humanidades y Ciencias Sociales
                                                    </MenuItem>
                                                </TextField>
                                            </Box>

                                            {/* Fila 3 */}
                                            <Box className="flex flex-col gap-1">
                                                <TextField
                                                    id="disponibilidad"
                                                    name="disponibilidad"
                                                    label="Disponibilidad"
                                                    variant="outlined"
                                                    value={formData.disponibilidad}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '56px', // Ajusta la altura aquí
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box className="flex flex-col gap-1">
                                                <TextField
                                                    id="carga_academica"
                                                    name="carga_academica"
                                                    label="Carga Académica"
                                                    variant="outlined"
                                                    value={formData.carga_academica}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    size="small"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            height: '56px', // Ajusta la altura aquí
                                                        }
                                                    }}
                                                />
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
                                                        area_conocimiento: '',
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