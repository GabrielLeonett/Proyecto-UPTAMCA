import React from 'react';
import ResponsiveAppBar from '@/components/navbar';
import { Head, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Swal from 'sweetalert2';
import { CircularProgress } from '@mui/material';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/login', {
            onSuccess: () => {
                Swal.fire({
                    title: '¡Bienvenido!',
                    text: 'Has iniciado sesión correctamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    timer: 2000,
                    timerProgressBar: true,
                }).then(() => {
                    window.location.href = '/home';
                });
            },
            onError: (errors) => {
                let errorMessage = 'Error al iniciar sesión';

                if (errors.username) {
                    errorMessage = errors.username;
                } else if (errors.password) {
                    errorMessage = errors.password;
                } else if (errors.message) {
                    errorMessage = errors.message;
                }

                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            },
            onFinish: () => {
                // Resetear campos si es necesario
            }
        });
    };

    return (
        <>
            <Head title="Inicio de sesión" />
            <ResponsiveAppBar
                pages={['Universidad', 'Académico', 'Servicios', 'Trámites']}
                backgroundColor
            />

            <Box className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 ">
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="shadow-xl p-8 flex flex-col justify-around rounded-xl w-full h-100 max-w-md bg-white"
                    noValidate
                    autoComplete="off"
                >
                    <Typography
                        variant="h5"
                        component="h1"
                        className="text-center my-10 font-bold text-gray-800"
                        sx={{ fontWeight: 700 }}
                    >
                        Inicio de sesión
                    </Typography>

                    <Box className="mb-5 w-full">
                        <Typography variant='body2' component={'label'} sx={{ fontWeight: 'regular' }} className='my-8 text-gray-700 font-semibold'>
                            Usuario
                        </Typography>
                        <TextField
                            fullWidth
                            id="username"
                            name="username"
                            label="Usuario"
                            variant="outlined"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            error={!!errors.username}
                            helperText={errors.username}
                            className="mb-1"
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                }
                            }}
                        />
                    </Box>

                    <Box className="mb-6 w-full">
                        <Typography variant='body2' sx={{ fontWeight: 'regular' }} className='mb-2 text-gray-700 font-semibold'>
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
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            className="mb-1"
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                }
                            }}
                        />
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        className="w-full py-3 rounded-xl text-lg font-medium"
                        disabled={processing}
                        sx={{
                            backgroundColor: '#2563eb',
                            '&:hover': {
                                backgroundColor: '#1d4ed8',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#93c5fd',
                            }
                        }}
                    >
                        {processing ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : 'Ingresar'}
                    </Button>

                    <Typography
                        variant="body2"
                        className="text-center mt-6 text-gray-600"
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