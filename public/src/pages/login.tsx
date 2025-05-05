import CustomButton from '../components/customButton';
import ResponsiveAppBar from '../components/navbar';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function Login() {
    const [data, setData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post('/login', {
                email: data.email,
                password: data.password,
            });

            console.log(response.data.icon)
            await Swal.fire({
                title: response.data.title || 'Éxito',
                text: response.data.text || 'Inicio de sesión exitoso',
                icon: response.data.icon || 'success',
                showConfirmButton: false,
            });
            
            



        } catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response) {
                // Error con respuesta del servidor (422, 401, etc.)
                const errorData = axiosError.response.data as {
                    message?: string;
                    errors?: Record<string, string[]>;
                    icon?: string;
                    text?: string;
                };
                
                setErrors(
                    Object.entries(errorData.errors || {})
                        .reduce((acc, [key, value]) => ({
                            ...acc,
                            [key]: value[0] // Tomamos solo el primer mensaje de error
                        }), {})
                );

                await Swal.fire({
                    title: 'Error',
                    text: errorData.message || errorData.text || 'Error al iniciar sesión',
                    icon: 'error',
                });
            } else {
                // Error de red o sin respuesta
                await Swal.fire({
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    icon: 'error',
                });
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <ResponsiveAppBar pages={['Universidad', 'Académico', 'Servicios', 'Trámites']} backgroundColor />

            <Box className="my-10 flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-around gap-4 rounded-2xl bg-white p-20 shadow-2xl sm:w-full md:w-140"
                    noValidate
                    autoComplete="off"
                >
                    <Typography variant="h5" component="h1" className="my-10 text-center font-bold text-gray-800" sx={{ fontWeight: 600 }}>
                        Inicio de sesión
                    </Typography>

                    <Box className="mb-5 w-full">
                        <Typography variant="body2" component={'label'} sx={{ fontWeight: 500 }} className="text-gray-700">
                            Correo electrónico
                        </Typography>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={data.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            className="mb-1"
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                },
                            }}
                        />
                    </Box>

                    <Box className="mb-6 w-full">
                        <Typography variant="body2" sx={{ fontWeight: 500 }} className="mb-2 font-semibold text-gray-700">
                            Contraseña
                        </Typography>
                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Contraseña"
                            type="password"
                            variant="outlined"
                            value={data.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            className="mb-1"
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                },
                            }}
                        />
                    </Box>

                    <CustomButton
                        type="submit"
                        variant="contained"
                        className="h-15 w-full rounded-xl py-3 font-medium"
                        disabled={processing}
                        tipo="primary"
                    >
                        {processing ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
                    </CustomButton>

                    <Typography
                        variant="body2"
                        className="mt-6 text-center text-gray-600"
                        sx={{ '& a': { color: '#3b82f6', textDecoration: 'none' } }}
                    >
                        <a href="/support" className="hover:underline">
                            ¿Problemas para acceder? Contacta al soporte
                        </a>
                    </Typography>
                </Box>
            </Box>
        </>
    );
}