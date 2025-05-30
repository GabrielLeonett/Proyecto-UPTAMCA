import ResponsiveAppBar from '../components/navbar';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Profesores() {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/profesor');
                console.log('Profesores fetched:');
                setProfesores(response.data.data);
            } catch (error) {
                console.error('Error fetching profesores:', error);
                setError('No se pudo cargar la lista de profesores');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <ResponsiveAppBar
                pages={["registerProfesor", "Académico", "Servicios", "Trámites"]}
                backgroundColor
            />
            
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Profesores
                </Typography>
                
                <Typography variant="body1" paragraph>
                    Bienvenido a la página de gestión de profesores. Aquí puedes ver todos los profesores registrados en el sistema.
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Cédula</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellido</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Área</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {profesores.map((profesor) => (
                                    <TableRow key={profesor.id}>
                                        <TableCell>{profesor.id}</TableCell>
                                        <TableCell>{profesor.nombres}</TableCell>
                                        <TableCell>{profesor.apellidos}</TableCell>
                                        <TableCell>{profesor.email}</TableCell>
                                        <TableCell>{profesor.area_conocimiento}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </>
    );
}